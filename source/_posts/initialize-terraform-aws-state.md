---
title: Initialize Terraform AWS State Resources
date: 2024-09-12 15:09:52
categories:
  - DevOps
  - Troubleshooting
tags:
  - AWS
  - Terraform
---

So, I have a funny story. I was testing a new app in Terraform, and thought it would be a good idea to define my Terraform State bucket and lock table in the Terraform code. Everything went well, all my infrastructure was defined as code, and for a while everything was perfect...

<!-- more -->

Then I decided to move my app from `us-east-2` to `us-east-1`, so I ran `terraform destroy` and go walk my dog.

Lo and behold - that was a **Noob** move. Terraform deleted my state bucket and table too early, and the operation failed.

There is probably a way to make Terraform delete those resources last, but I think its safest to simply create them outside of your IaC. Here is a quick CLI script to make it simple.

## Create Terraform State Resources Commands

```bash
aws s3api create-bucket --bucket my-tf-state
aws s3api put-bucket-versioning --bucket my-tf-state --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket my-tf-state --server-side-encryption-configuration '{
  "Rules": [
    {
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }
  ]
}'
aws dynamodb create-table \
    --table-name my-tf-lock \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```
