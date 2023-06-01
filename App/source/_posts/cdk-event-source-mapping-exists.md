---
title: DDB Streams Event Source Mapping Already Exists Error
date: 2023-06-01 15:45:30
categories:
  - Troubleshooting
tags:
  - AWS
  - CDK
---

When updating a lambda with a DynamoDB Streams event source I got a mapping already exists error

<!--more-->

## Error

```text
10:54:08 AM | CREATE_FAILED | AWS::Lambda::EventSourceMapping | *
Resource handler returned message: "The event source arn * and function * provided mapping already exists. Please update or delete the existing mapping with UUID *.
```

## Resolution

Check if your CDK Metadata path has changed. Changing the stack or construct logical id will change the metadata path.

If the logical id change was intentional, manually delete the mapping and redeploy.

## More Info

When the path changes CDK attempts to replace the mapping. Since CloudFormation must create a new resource before deleting the old, this threw a mapping already exists error.

In my case I changed the stack logical id, which triggered a replacement on the event source mapping.
