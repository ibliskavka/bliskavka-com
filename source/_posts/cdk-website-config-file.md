---
title: 'Write config.json to S3 with AWS CDK'
date: 2022-02-10 09:11:45
categories:
  - HowTo
tags:
  - CDK
  - DevOps
---

To make prebuilt SPA installers with CDK I like to keep environment configuration outside of the minified code via a `config.json` file. This allows me to build the app once and move it between environments and stages.

<!-- more -->

The file contains settings like Cognito Pool ID, region, and/or branding information.

I used to write my own Custom Resource for building this file but recently discovered a simpler CDKV2 way! Credit: [aws-cdk-v2-three-tier-serverless-application/](https://www.freecodecamp.org/news/aws-cdk-v2-three-tier-serverless-application/)

I am copy-pasting the relevant code for future reference.

```typescript
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const myConfig = {
  prefix: 'some-static-value',
  userPoolId: userPool.userPoolId,
  // Call toString() on tokens
  region: Aws.REGION.toString(),
  etc,
};

new AwsCustomResource(this, 'SpaConfig', {
  logRetention: RetentionDays.ONE_DAY,
  onUpdate: {
    action: 'putObject',
    parameters: {
      Body: JSON.stringify(myConfig),
      Bucket: websiteBucket.bucketName,
      CacheControl: 'max-age=0, no-cache, no-store, must-revalidate',
      ContentType: 'application/json',
      Key: 'config.json',
    },
    physicalResourceId: PhysicalResourceId.of('config'),
    service: 'S3',
  },
  policy: AwsCustomResourcePolicy.fromStatements([
    new PolicyStatement({
      actions: ['s3:PutObject'],
      resources: [websiteBucket.arnForObjects('config.json')],
    }),
  ]),
});
```

## Pitfall

I have a `config.json` in the SPA deploy assets also, so with each rebuild and redeploy, CloudFormation was replacing and overwriting the `config.json` from SPA assets. I added this to the `myConfig` object above to force the custom resource to execute with each `cdk deploy`

```typescript
buildTime: new Date().toISOString();
```
