---
title: My Blogging Software
date: 2024-02-25 10:54:44
tags:
  - AWS
  - CDK
  - Writing
---

If you are looking for a low-cost blogging platform on AWS, look no further!

I wanted something very easy to use, which has a lot of features, and uses familiar tools.

For this blog I settled on Hexo, a static site generator. I have also used the more popular Hugo which solves the same problem.

For hosting, I am using AWS S3 with CloudFront and Route53. Deployed using CDK.

This setup is pretty easy if you are comfortable with Node and CDK. If you are not, you can refer to my blog repo on GitHub.

## Basic Steps

- [Init a new Hexo app](https://hexo.io/docs/index.html)
- `npm install aws-cdk aws-cdk-lib`
- Create a `cdk/index.ts` entry file
  - Change the string parameters to match your environment
- Create a `cdk.json` file
- Create the helper scripts in package.json
  - The bucket name and DistributionId will not be available until you run the deploy
