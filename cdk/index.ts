import {
  StaticWebsite,
  StaticWebsiteOrigin,
} from '@aws-prototyping-sdk/static-website';
import { App, Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import path from 'path';

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

const website = new StaticWebsite(stack, 'Hosting', {
  websiteContentPath: path.resolve('public'),
  webAclProps: {
    disable: true,
  },
  distributionProps: {
    domainNames: [baseUrl, subDomain],
    certificate,
    defaultBehavior: {
      origin: new StaticWebsiteOrigin(),
    },
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
