---
title: My Blogging Tools
date: 2024-02-25 10:54:44
tags:
  - AWS
  - CDK
  - Writing
---

If you are looking for a low-cost blogging platform on AWS, look no further!

I wanted something very easy to use, which has a lot of features, and uses my core tools (AWS, Node, CDK, Markdown).

For this blog I settled on [Hexo](https://hexo.io/docs/index.html), a static site generator. I have also used the more popular [Hugo](https://gohugo.io/) which solves the same problem.

For hosting, I am using AWS S3 with CloudFront and Route53. Deployed using CDK.

This setup is pretty easy if you are comfortable with Node and CDK. If you are not, you can refer to [my blog repo on GitHub](https://github.com/ibliskavka/bliskavka-com/tree/main).

## Prerequisites

- AWS Account
- AWS CLI Access
- Familiarity with NodeJS
- Familiarity with CDK is a plus

## Highlights

- [Init a new Hexo app](https://hexo.io/docs/index.html)
- `npm install aws-cdk aws-cdk-lib`
- Create a [cdk/index.ts](https://github.com/ibliskavka/bliskavka-com/blob/main/cdk/index.ts) entry file
  - Change the string parameters to match your environment
  - Assuming Route53 and ACM Cert already exists. If not, comment out those resources to use the CloudFront URL.
- Create a [cdk.json](https://github.com/ibliskavka/bliskavka-com/blob/main/cdk.json) file
- Create the helper scripts in [package.json](https://github.com/ibliskavka/bliskavka-com/blob/main/package.json)
  - The publish script parameters (BucketName & DistributionId) will not be available until you run the deploy
  - [More info on CDK package scripts](http://localhost:3000/2023/03/02/cdk-package-scripts/)
