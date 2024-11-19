---
title: CDK Construct for Athena DynamoDB Connector
date: 2024-09-18 08:11:43
categories:
  - HowTo
tags:
  - CDK
  - AWS
  - HowTo
  - TypeScript
---

The AWS Athena connector for DynamoDB enables you to query data stored in Amazon DynamoDB using Amazon Athena, which is typically used to query structured data in S3 using standard SQL. Since DynamoDB is a NoSQL database, querying it with SQL isn’t straightforward by default. This connector provides a bridge between the two, allowing you to leverage Athena's SQL-based querying on data stored in DynamoDB.

## CDK Construct

The DataLake I am building requires that all data be encrypted with KMS, and deployed through CDK. This construct deploys the SAM template and configures all the necessary permissions. The OOTB role was too permissive, so I injected my own.

```typescript
import { aws_sam as sam, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { IKey } from 'aws-cdk-lib/aws-kms';
import {
  IGrantable,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Constants } from '../../constants';
import { Function, IFunction } from 'aws-cdk-lib/aws-lambda';

export interface AthenaConnector {
  grantRead: (grantee: IGrantable) => void;
}

interface DynamoConnectorProps {
  prefix: string;

  /**
   * What ddb tables it has access to
   */
  tables: ITable[];

  /**
   * What encryption key to use
   */
  encryptionKey: IKey;
}
/**
 * Provides Athena access to Dynamo tables
 * Source: https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:292517598671:applications/AthenaDynamoDBConnector
 * NOTE: You must manually register the connector: https://docs.aws.amazon.com/athena/latest/ug/connect-data-source-serverless-app-repo.html
 * NOTE: You must manually add this environment variable to the lambda: spill_put_request_headers={"x-amz-server-side-encryption" : "aws:kms"}
 */
export class DynamoConnector extends Construct implements AthenaConnector {
  readonly bucket: Bucket;
  readonly lambda: IFunction;

  constructor(scope: Construct, id: string, props: DynamoConnectorProps) {
    super(scope, id);
    const { prefix, tables, encryptionKey } = props;

    const name = `${prefix}-ddb-connector`;

    this.bucket = new Bucket(this, 'Bucket', {
      bucketName: name,
      encryptionKey,
      // Reduce KMS Costs
      bucketKeyEnabled: true,
    });
    // Ensure all bucket data is encrypted
    this.bucket.addToResourcePolicy(
      new PolicyStatement({
        sid: 'Deny Unencrypted Objects',
        actions: ['s3:PutObject'],
        effect: Effect.DENY,
        resources: [this.arnForObjects('*')],
        principals: [new AnyPrincipal()],
        conditions: {
          StringNotEquals: {
            's3:x-amz-server-side-encryption': 'aws:kms',
          },
        },
      })
    );

    const role = new Role(this, 'Role', {
      roleName: name,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    // KMS Permissions
    encryptionKey.grantEncryptDecrypt(role);
    role.addToPolicy(
      new PolicyStatement({
        actions: ['kms:GenerateRandom'],
        // GenerateRandom does not use any account-specific resources, such as KMS keys.
        resources: ['*'],
      })
    );

    // S3 Permissions
    role.addToPolicy(
      new PolicyStatement({
        actions: ['s3:ListAllMyBuckets'],
        resources: ['*'],
      })
    );
    role.addToPolicy(
      new PolicyStatement({
        actions: [
          's3:GetObject',
          's3:ListBucket',
          's3:GetBucketLocation',
          's3:GetObjectVersion',
          's3:PutObject',
          's3:PutObjectAcl',
          's3:DeleteObject',
          's3:GetLifecycleConfiguration',
          's3:PutLifecycleConfiguration',
        ],
        resources: [this.bucket.bucketArn, this.bucket.arnForObjects('*')],
      })
    );

    // DDB Permissions
    tables.forEach((t) => {
      // Allows connector to perform queries
      t.grantReadWriteData(role);
    });

    // Glue/Athena Permissions
    role.addToPolicy(
      new PolicyStatement({
        actions: [
          'athena:GetQueryExecution',

          'glue:GetTableVersions',
          'glue:GetPartitions',
          'glue:GetTables',
          'glue:GetTableVersion',
          'glue:GetDatabases',
          'glue:GetTable',
          'glue:GetPartition',
          'glue:GetDatabase',

          // Allows Athena Query Explorer to show schema. Required on first run for Athena to discover schemas
          // Can probably be commented out later to avoid oversharing data
          'dynamodb:ListTables',
          'dynamodb:DescribeTable',
          'dynamodb:ListSchemas',
          'dynamodb:Scan',
        ],
        resources: ['*'],
      })
    );

    const { region } = Stack.of(scope);
    new sam.CfnApplication(this, 'App', {
      location: {
        applicationId: `arn:aws:serverlessrepo:${region}:292517598671:applications/AthenaDynamoDBConnector`,
        semanticVersion: '2024.25.1',
      },
      parameters: {
        LambdaRole: role.roleArn,
        // This is the name of the lambda function that will be created. This name must satisfy the pattern ^[a-z0-9-_]{1,64}$
        AthenaCatalogName: name,
        DisableSpillEncryption: 'false',
        SpillBucket: this.bucket.bucketName,
        KMSKeyId: this.bucket.encryptionKey.keyId,
        LambdaMemory: '512',
      },
    });

    this.lambda = Function.fromFunctionName(this, 'Connector', name);
  }

  grantRead(grantee: IGrantable) {
    this.bucket.grantRead(grantee);
    this.lambda.grantInvoke(grantee);
  }
}
```

### Manual Steps

- You must manually [register the connector with Athena](https://docs.aws.amazon.com/athena/latest/ug/connect-data-source-serverless-app-repo.html)
- To use KMS you must manually add this environment variable to the lambda: `spill_put_request_headers={"x-amz-server-side-encryption" : "aws:kms"}`

## Drawbacks

This worked perfectly for small, homogeneous and relatively flat tables, but you may run into problems if:

- You have nested schemas
  - The connector could not infer nested object schemas well and would fail
- You have a lot of columns. I had a flattened table with ~1,000 columns, whenever I ran `SELECT *` the query failed. When I queried specific columns it succeeded.
  - Under the hood, the connector creates Projection Expressions. ~1000 columns created massive expressions that were rejected by DynamoDB.

## Alternative for Large Tables

I still use the connector in a few places, but for the really wide table I went with another approach.

I am using DDB for operational processes during the day. The reporting data does not need to be realtime, and could be rebuilt nightly.

- A nightly Lambda triggers a DDB Table Export to S3 ($.50/GB)
- When the export drops, another Lambda
  - Unmarshalls the JSON data and stores it in a S3 staging prefix
  - Invokes an Athena Query to `INSERT * INTO optimized_table SELECT * FROM json_table`
    - `json_table` is a Glue table definition over the staged unmarshalled JSON data
    - `optimized_table` is a Glue table definition using Parquet, Snappy, and Partitioning
    - NOTE: The query also performs some deduping, which I omitted for brevity
- Reporting is done on `optimized_table` which is super compressed and fast.

### Other Tips

- If your data is strictly transactional, you may be able to delete the DDB source data to reduce costs
  - If you have a lot of data, the Table `Scan` + `BatchDelete` operation may be too slow. In my case, the Lambda was timing out after 15 minutes
  - Solution: Delete and recreate the table using the SDK.

## Troubleshooting

### Athena Dynamo DB Connector returns 0 rows

Re-run your query with `LIMIT 10`, if the query succeeds check your lambda logs. You may be getting a permission denied when writing to the spill bucket.

Solution: Manually add this environment variable to the lambda:

- `spill_put_request_headers`=`{"x-amz-server-side-encryption" : "aws:kms"}`

### Athena Dynamo DB Connector Error: Invalid ProjectionExpression

Selecting certain fields works
`SELECT foo, bar FROM "default"."datalake" limit 10;`

Selecting all fields fails. I am guessing this is because connector puts all the columns into the ProjectionExpression.

`SELECT * FROM "default"."datalake" limit 10;`

```bash
GENERIC_USER_ERROR: Encountered an exception[software.amazon.awssdk.services.dynamodb.model.DynamoDbException] from your LambdaFunction[arn:aws:lambda:{region}:{account}:function:ddb-connector] executed in context[S3SpillLocation{bucket='ddb-connector', key='athena-spill/xxx', directory=true}] with message[Invalid ProjectionExpression: Expression size has exceeded the maximum allowed size; (Service: DynamoDb, Status Code: 400, Request ID: xxx)]
```
