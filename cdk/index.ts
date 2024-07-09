import { StaticWebsite, StaticWebsiteOrigin } from '@aws/pdk/static-website';
import { App, CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  Function,
  FunctionCode,
  FunctionEventType,
} from 'aws-cdk-lib/aws-cloudfront';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import path, { join } from 'path';

const baseUrl = 'bliskavka.com';
const subDomain = `www.${baseUrl}`;

const app = new App();
const stack = new Stack(app, 'Stack', {
  stackName: 'bliskavka-com',
  env: {
    region: 'us-east-1',
    account: '857240696749',
  },
});

const certificate = Certificate.fromCertificateArn(
  stack,
  'AcmCert',
  'arn:aws:acm:us-east-1:857240696749:certificate/4cabb1e7-2422-4f2d-b1cc-32c82378fff7'
);

const bucket = new Bucket(stack, 'Assets', {
  bucketName: `${stack.stackName}-assets`,
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const website = new StaticWebsite(stack, 'Hosting', {
  websiteBucket: bucket,
  websiteContentPath: path.resolve('public'),
  webAclProps: {
    // Turn off WAF to save on costs
    disable: true,
  },
  distributionProps: {
    domainNames: [baseUrl, subDomain],
    certificate,
    defaultBehavior: {
      origin: new StaticWebsiteOrigin(),
      functionAssociations: [
        {
          eventType: FunctionEventType.VIEWER_REQUEST,
          function: new Function(stack, 'Function', {
            comment: 'Automatically append index.html to requests',
            code: FunctionCode.fromFile({
              filePath: join(__dirname, 'handler.js'),
            }),
          }),
        },
      ],
    },
    // This doesn't seem to have an effect. Added 30 expiration manually.
    enableLogging: true,
    // Dont redirect to index.html by default. This causes a recursive URL rewrite and increases crawler cost
    errorResponses: [],
  },
});

const zone = HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
  hostedZoneId: 'ZLZXN2HT4MQAF',
  zoneName: baseUrl,
});

new ARecord(stack, 'Base', {
  zone,
  recordName: baseUrl,
  target: RecordTarget.fromAlias(
    new CloudFrontTarget(website.cloudFrontDistribution)
  ),
});

new ARecord(stack, 'Web', {
  zone,
  recordName: subDomain,
  target: RecordTarget.fromAlias(
    new CloudFrontTarget(website.cloudFrontDistribution)
  ),
});

new CfnOutput(stack, 'BucketName', {
  value: website.websiteBucket.bucketName,
});

new CfnOutput(stack, 'DistributionId', {
  value: website.cloudFrontDistribution.distributionId,
});
