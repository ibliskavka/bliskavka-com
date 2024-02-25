---
title: >
  "Error: Unable to upload artifact referenced by Location parameter of resource. 'S3Uploader' object is not subscriptable."

date: 2020-12-18 10:12:06
categories:
  - Troubleshooting
tags:
  - AWS
  - CloudFormation
  - AWS SAM CLI
---

While working on a multi-stack AWS SAM package I came across this rather obscure error:

> **Error**: Unable to upload artifact ../../spa-hosting.yaml referenced by Location parameter of Hosting resource. 'S3Uploader' object is not subscriptable

<!-- more -->

After an embarrassing amount of troubleshooting, the culprit turns out to be the `Metadata[AWS::ServerlessRepo::Application]` element in the nested stack.

The nested stack is also published to the Serverless Application Repository, but I copied the template into this project for some additional customizations. As soon as I removed that element, the stack deployed correctly.

```yaml
# template.yaml

Hosting:
  Type: AWS::Serverless::Application
  Properties:
    Location: ../../spa-hosting.yaml
    Parameters:
      BucketName: !Ref AWS::StackName
```

```yaml
# spa-hosting.yaml

Metadata:
  AWS::ServerlessRepo::Application:
    Name: spa-hosting
    Description: Creates the AWS infrastructure for running a Single Page App  in AWS using S3 & CloudFront
    Author: Ivan Bliskavka
    ReadmeUrl: README.md
    HomePageUrl: https://bliskavka.com
    SemanticVersion: 1.0.0
```

I hope this saves somebody some headaches!

-Ivan
