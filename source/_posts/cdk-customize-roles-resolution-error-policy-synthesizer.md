---
title: 'CDK Resolution error: PolicySynthesizer should be created in the scope of a Stack, but no Stack found'
date: 2024-02-16 10:47:00
categories:
  - Troubleshooting
tags:
  - AWS
  - CDK
---

We occasionally have a client who does not allow us to create IAM roles in their AWS account. In this scenario we must define the roles in CloudFormation, they create them, and we inject the role ARNs into the app.

In the CloudFormation days, this would have been a significant overhaul if your app was not already set up for it. But with CDK, this is pretty easy with the [Role.customizeRoles](https://github.com/aws/aws-cdk/wiki/Security-And-Safety-Dev-Guide#using-the-customize-roles-feature-to-generate-a-report-and-supply-role-names) method.

While working on such a project, we bumped into this weird error:

```text
Error: Resolution error: Resolution error: PolicySynthesizer at 'PolicySynthesizer' should be created in the scope of a Stack, but no Stack found.
Object creation stack:
  at stack traces disabled.
Object creation stack:
  at Execute again with CDK_DEBUG=true to capture stack traces
    at _lookup (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/stack.js:1:3005)
    at _lookup (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/stack.js:1:3178)
    at Function.of (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/stack.js:1:2736)
    at Object.produce (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/resource.js:1:4264)
    at Reference.resolve (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/resource.js:1:4877)
    at DefaultTokenResolver.resolveToken (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/resolvable.js:1:1401)
    at resolve (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/private/resolve.js:1:2711)
    at Object.resolve [as mapToken] (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/private/resolve.js:1:1079)
    at TokenizedStringFragments.mapTokens (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/string-fragments.js:1:1475)
    at DefaultTokenResolver.resolveString (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/resolvable.js:4:362)
```

The above error doesn't provide any meaningful info, but if you follow the instructions like so:

`CDK_DEBUG=true npm run cdk -- synth`

You get a much more meaningful error

```text
Error: Resolution error: Resolution error: PolicySynthesizer at 'PolicySynthesizer' should be created in the scope of a Stack, but no Stack found.
Object creation stack:
  at new Intrinsic (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/private/intrinsic.js:1:942)
  at new Reference (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/reference.js:1:599)
  at new <anonymous> (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/resource.js:1:4806)
  at mimicReference (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/resource.js:1:4802)
  at CacheTable.getResourceArnAttribute (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/resource.js:1:4185)
  at new Table (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/aws-dynamodb/lib/table.js:1:18313)
  at new CacheTable (/home/ibliskavka/git/data-lakedata/packages/caching/src/constructs/CacheTable.ts:20:5)
  ... (truncated)
Object creation stack:
  at Function.string (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/core/lib/lazy.js:1:953)
  at CacheTable.combinedGrant (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/aws-dynamodb/lib/table.js:1:13211)
  at CacheTable.grantReadWriteData (/home/ibliskavka/git/data-lakedata/node_modules/aws-cdk-lib/aws-dynamodb/lib/table.js:1:6157)
  ... (truncated)
```

The `CacheTable.grantReadWriteData` stack trace deals with permissions (which we are customizing), so I traced it down to this bit of code

```typescript
export class CachingLambdaRole extends Role {
  constructor(scope: Construct, id: string, props: CachingLambdaRoleProps) {
    super(scope, id, {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
    props.table.grantReadWriteData(this);
  }
}
```

When I replaced `props.table.grantReadWriteData(this)` with policy statements in the role `inlinePolicy` the error went away and I was able to deploy.

## TL;DR;

1. Enable CDK_DEBUG
2. Check if your stack trace uses the `grant` API. If so, try replacing it with policy statements.

## More Info

I was able to find only a few articles about this error message and none of them dealt with `customizeRoles`. I suspect this may be a bug in the CDK code because my app uses the `grant` API elsewhere in the code and it works as-is.
