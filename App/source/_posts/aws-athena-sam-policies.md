---
title: AWS Athena SAM Policies
date: 2021-12-24 12:04:07
categories:
- HowTo
tags:
- AWS
- HowTo
- Security
- AWS SAM CLI
---

AWS Athena provides SQL queries over S3 data. The service depends on S3, Glue, and Athena itself so getting permissions set up can be tricky. Here is what worked for me.

<!-- more -->

```yaml
StartQueryFunction:
  Type: AWS::Serverless::Function
  Properties:
    Handler: src/lambda/search.start
    Policies:
      - S3ReadPolicy:
          BucketName: !Ref DataBucket
      - S3CrudPolicy:
          BucketName: !Ref AthenaResultsBucket
      - AthenaQueryPolicy:
          WorkGroupName: !Ref AthenaWorkGroup
      - Statement:
        - Effect: Allow
          Action:
          - glue:GetTable
          Resource:
          - !Sub arn:aws:glue:${AWS::Region}:${AWS::AccountId}:catalog
          - !Sub arn:aws:glue:${AWS::Region}:${AWS::AccountId}:database/${GlueDatabase}
          - !Sub arn:aws:glue:${AWS::Region}:${AWS::AccountId}:table/${GlueDatabase}/*

GetResultFunction:
  Type: AWS::Serverless::Function
  Properties:
    Handler: src/lambda/search.results
    Policies:
      - S3CrudPolicy:
          BucketName: !Ref AthenaResultsBucket
      - AthenaQueryPolicy:
          WorkGroupName: !Ref AthenaWorkGroup
```

Cheers!