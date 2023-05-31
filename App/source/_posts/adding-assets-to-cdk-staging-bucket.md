---
title: Adding Assets to CDK Staging Bucket
date: 2023-05-31 11:45:30
categories:
  - HowTo
tags:
  - AWS
  - CDK
  - DevOps
---

Today I discovered that you can deploy arbitrary files to the CDK staging bucket with a human readable file name!

This feature is awesome if you are [pre-synthing CDK apps to CloudFormation Templates](/2022/02/07/synth-cdk-to-custom-bucket).

<!-- more -->

My first attempt was to use [Asset](https://docs.aws.amazon.com/cdk/v2/guide/assets.html) but it used the file hash for the file name, which could change over time and is not user friendly.

After playing around with a few methods, I discovered that you can do this.

```typescript
class MyStack extends Stack{
  constructor(...){
    this.synthesizer.addFileAsset({
      sourceHash: 'RELEASE_NOTES',
      fileName: join(rootDir, 'RELEASE_NOTES.md'),
      packaging: FileAssetPackaging.FILE
    })
  }
}
```

In the above sample, the `sourceHash` is used to create the file name: `RELEASE_NOTES.md`. Since I publish templates under their version prefix, the file hash is unimportant to me!

## More Context

We generate pre-synthed templates for very complex applications which are:

- shared with clients using a S3 bucket policy
- installed by a non-developer using CloudFormation QuickStart URLs
- capable of automatically updating itself by checking the bucket for a newer version and initiating a `cloudformation update`

Including a `RELEASE_NOTES.md` allows the template consumer to make a more informed decision on when to upgrade.

Cheers!

![Me with a cat in Santorini, Greece 2017](cat.jpg)
