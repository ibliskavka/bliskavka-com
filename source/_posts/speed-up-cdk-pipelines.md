---
title: Speed up CDK Pipelines Deployment
date: 2022-09-25 17:23:01
categories:
  - HowTo
tags:
  - CDK
  - DevOps
---

I recently converted a large CDK app to use CDK Pipelines. I LOVE how quickly it was to get working but it generated a UGLY and SLOW pipeline.

<!-- more -->

- The large app had ~50 assets, so a Publish Assets CodeBuild was generated for each asset (UGLY).
- Often the publish step took longer than the deploy because the CodeBuilds were queued and only 5-10 ran at one time.
- One of our client accounts hit a CodeBuild soft limit :(

## Solution

After some Google-fu, I found the solution on the [cdk.dev](https://cdk.dev) Slack channel!

```typescript
new CodePipeline(this, 'Pipeline', {
  // Set this to false!
  publishAssetsInParallel: false,
});
```

By default, `publishAssetsInParallel` is on, creating the issues listed above. After I turned it off I had immediate gratification!

## Results

- Only 1 CodeBuild was generated to publish assets (prettier).
- Deployment time for the ~50 asset project was reduced by 20 minutes.
- On another project, the self-mutate step was reduced from ~60 to 6 minutes!

Your mileage may vary, but it's a very simple change that you can validate quickly. Good Luck!
