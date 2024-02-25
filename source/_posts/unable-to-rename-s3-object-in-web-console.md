---
title: >
  "Unable to move or rename S3 object using web console"

date: 2021-09-06 14:12:06
categories:
  - Troubleshooting
tags:
  - AWS
  - CloudFormation
  - AWS SAM CLI
---

I was deploying an IAM user policy using AWS CloudFormation and granted CRUD access to the bucket, but the user could not rename or move a file using the web console.

<!-- more -->

I was trying to move files and kept getting denied. Then I simply tried renaming files and also got an access denied. I was able to upload and delete files though.

I looked at CloudTrail, and there was no obvious access denied.

I enabled S3 full control `s:*`, but I was still getting the same error.

I then tried to rename and move files using the CLI, which worked just fine.

Finally, I opened the IAM visual editor and created an entirely new policy for the user, which worked. After inspecting the policy, I noticed some permissions were scoped to the `*` resource, and not scoped to any ARN. After I added those to my CloudFormation, the user was able to move files using the web console.

```yaml
# S3 CRUD policy
- Effect: Allow
  Action:
    - s3:GetObject
    - s3:GetObjectAcl
    - s3:ListBucket
    - s3:GetBucketLocation
    - s3:GetObjectVersion
    - s3:PutObject
    - s3:PutObjectAcl
    - s3:GetLifecycleConfiguration
    - s3:PutLifecycleConfiguration
    - s3:DeleteObject
  Resource:
    - !Sub arn:${AWS::Partition}:s3:::${DataBucket}
    - !Sub arn:${AWS::Partition}:s3:::${DataBucket}/*
```

```yaml
# Additional S3 Permissions
- Effect: Allow
  Action:
    - s3:ListStorageLensConfigurations
    - s3:ListAccessPointsForObjectLambda
    - s3:GetAccessPoint
    - s3:PutAccountPublicAccessBlock
    - s3:GetAccountPublicAccessBlock
    - s3:ListAllMyBuckets
    - s3:ListAccessPoints
    - s3:ListJobs
    - s3:PutStorageLensConfiguration
    - s3:ListMultiRegionAccessPoints
    - s3:CreateJob
  Resource: '*'
```

After some testing, turns out that `s3:ListAllMyBuckets` permission is required to be able to move and rename files using the web UI!

```yaml
- Effect: Allow
  Action:
    - s3:ListAllMyBuckets
  Resource: '*'
```

This is weird because you might not want to list all your buckets if you have multiple clients/departments on the same account.

I hope this helps someone :)
