---
title: Synth CDK app to Custom Bucket
date: 2022-02-07 17:04:53
categories:
  - HowTo
tags:
  - CloudFormation
  - CDK
---

Some AWS customers don't use the CLI, and will not grant an external contractor CLI access. Trying to get access is a waste of time and resources. Do not fear, there is a solution!

<!-- more -->

## Summary

1. Create a client-specific staging bucket
2. Share the bucket with the client account via the Bucket Policy
3. Synth the stack to the staging bucket
4. Share template URL with client
5. The client can install using the URL in CloudFormation web console with their user credentials

## App Staging Bucket Policy

```json
{
  "Sid": "MyClient",
  "Effect": "Allow",
  "Principal": {
    "AWS": [
      "arn:aws:iam::DEV_ACCOUNT_ID:root",
      "arn:aws:iam::PROD_ACCOUNT_ID:root"
    ]
  },
  "Action": ["s3:GetObject", "s3:GetObjectVersion"],
  "Resource": "arn:aws:s3:::app-staging-bucket/*"
}
```

## Usage

1. Install CDK Assets `npm i -D cdk-assets`
2. Customize the stack synthesizer to use your custom staging bucket

   ```typescript
   const app = new cdk.App();

   new MyApp(app, 'template', {
     someParam: 'someValue',
     synthesizer: new DefaultStackSynthesizer({
       fileAssetsBucketName: 'app-staging-bucket',

       // Use a custom role which has access to the asset bucket
       fileAssetPublishingRoleArn: 'my-client-staging-role',

       // Consider using a build date or version
       bucketPrefix: '2.4.1',

       // The client account does not need to be bootstrapped
       generateBootstrapVersionRule: false,
     }),
   });

   app.synth();
   ```

3. Run `cdk synth` to generate your assets.
4. Modify `cdk.out/template.assets.json` to make the template file name more predictable
   - find the entry with `sourcePath`=`template.template.json`
   - modify its `objectKey` to something like `2.4.1/template.json`
   - (you should probably write some code to automate this)
5. Run `cdk-assets -v -p ./cdk.out/template.assets.json publish`
6. Share your template URL with the client. It will look something like:  
   `https://app-staging-bucket.s3.amazonaws.com/2.4.1/template.json`
7. Client can install the app using the CloudFormation web console.

## Simpler Template Output

Not sure what the side effects of these are, but this produces a simpler template with less CDK metadata.

`cdk synth --path-metadata false --version-reporting false`

### cdk.json

```json
{
  "context": {
    "@aws-cdk/core:newStyleStackSynthesis": false
  }
}
```

## Conclusion

This has been very helpful for creating installers that are accessible to non-developers and usable in beginner AWS environments. I hope it saved you some head-scratching!
