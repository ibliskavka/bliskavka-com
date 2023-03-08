---
title: CDK package.json Scripts
date: 2023-03-02 17:54:46
categories:
  - HowTo
tags:
  - AWS
  - CDK
  - DevOps
---

I found the following package.json scripts very convenient when managing a complex CDK app. The key is the `--` operator, which allows us to append additional parameters.

<!-- more -->

```json
{
  "scripts": {
    "build": "tsc --noEmit",
    "cdk": "npm run build && cdk",
    "cdk:pipeline": "npm run build && cdk --app 'npx ts-node --prefer-ts-exts bin/pipeline.ts'",
    "test": "jest",
    "diff": "npm run cdk -- diff",
    "synth": "npm run cdk -- synth --quiet",
    "deploy": "npm run cdk -- deploy --all --require-approval never",
    "deploy:pipeline": "npm run cdk:pipeline -- deploy --all --require-approval never"
  }
}
```

This configuration allows us to create convenient scripts like deploy/diff/synth, but we still have the ability to pass in additional parameters like:

`npm run deploy -- --no-rollback --profile default`

I can also define multiple entry points

- `cdk`: Interact with the stack directly.
- `cdk:pipeline`: Deploy a CDK Pipeline which is able patch the CDK app when new changes are pushed.

A pipeline execution can be slow, so being able to circumvent the pipeline in a dev/sandbox environment is extremely useful.
