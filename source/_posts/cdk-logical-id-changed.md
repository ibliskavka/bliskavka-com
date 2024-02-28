---
title: 'Help: Logical ID Changed in my CDK App'
date: 2021-09-17 10:19:49
categories:
  - Troubleshooting
tags:
  - CDK
  - AWS
---

I recently came across a weird error in a private package CDK deployment:

`{dynamo table name} already exists in stack {current stack arn}`

Upon further investigation it turned out that one of our internal CDK modules for building the dynamo tables had changed how it was naming the construct, resulting in a different CloudFormation Logical ID. Since we were explicitly naming the table, the stack update could not complete, because the table already exists.

This app is a self-contained NPM module, so I wasn't able to modify the construct, but I came up with a workaround.

1. Back up the dynamo table data
2. Copy the raw stack YAML from CloudFormation and save it on your computer
3. Delete the table resource and references from the template
4. Update the stack with the new template using the CloudFormation web console
5. Verify that the table was deleted (and not retained) by CloudFormation
6. Redeploy the CDK app, which will create a new table
7. Restore the table data
