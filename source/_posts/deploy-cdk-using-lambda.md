---
title: How to Deploy CDK Using Lambda
date: 2024-10-03 16:34:40
categories:
  - HowTo
tags:
  - cdk
  - aws
  - HowTo
  - TypeScript
---

I really like the declarative nature of CloudFormation - you describe an end-state, and it computes the diffs. CDK gives me even more flexibility in creating complex apps.

Recently I built a CDK web application that could provision other CDK apps. React app sends a message to API GW, which invokes a lambda, which triggers a CDK deployment.

The default Lambda runtime cannot deploy CDK. You have to use a custom Docker image. There are plenty of online guides on how to do this, so I am only covering the highlights.

## Deployer Stack

It takes a while to build the docker container, so you should define a deployer stack separate from your web app.

It is also handy to add the following script to your package.json:

`"cdk:deployer": "npm run cdk -- --app=\"npx ts-node --prefer-ts-exts bin/deployer.ts\""`

```typescript
import { StackProps, Stack, Duration, CfnOutput, Aws } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  Architecture,
  DockerImageCode,
  DockerImageFunction,
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { PROJECT_ROOT } from '../../constants';

interface DeployerStackProps extends StackProps {
  prefix: string;
}
/**
 * Deploys the cdk deployer lambda.
 * Implemented as own stack with export because it takes a while to build and deploy.
 * You should redeploy this when your CDK code changes
 */
export class DeployerStack extends Stack {
  readonly deployFunctionArn: CfnOutput;

  constructor(scope: Construct, id: string, props: DeployerStackProps) {
    const { prefix } = props;
    super(scope, id, { stackName: `${prefix}-deployer`, ...props });

    const deploy = new DockerImageFunction(this, 'Deploy', {
      code: DockerImageCode.fromImageAsset(PROJECT_ROOT),
      timeout: Duration.minutes(15),
      memorySize: 4096,
      initialPolicy: [
        // Scope this down to whatever you need.
        new PolicyStatement({
          resources: [
            `arn:aws:iam::${Aws.ACCOUNT_ID}:role/cdk-hnb659fds-*-role-${Aws.ACCOUNT_ID}-*`,
          ],
          actions: ['sts:AssumeRole'],
        }),
      ],
      environment: {
        // Required to use npx
        HOME: '/tmp',
      },
    });

    this.deployFunctionArn = new CfnOutput(this, 'DeployFunctionArn', {
      value: deploy.functionArn,
      exportName: `${prefix}-deployer-function-arn`,
    });
  }
}
```

Notice the `deployer-function-arn` export. You will want to import this into your other app.

## Dockerfile

This docker file will copy your entire application, and set the lambda entry point.

```dockerfile
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy in pre-installed/built resources
COPY . .

# Entry point
CMD ["dist/lib/DeployerStack/lambda/index.handler"]
```

Note: I found a few examples online which use a different base image (`node:18-bookworm`), which require additional steps including installing `aws-lambda-ric`, but I ran into some issues.

- After a certain amount of pulls from the Docker registry, you will have to sign up. For AWS work, ECR is fast and automatic.
- The `public.ecr.aws/lambda/nodejs:20` image is already configured for running node apps. Total build time dropped from ~15 to 4.5 minutes.

## Deployer Lambda

Here is the lambda entry point. Notice the handler accepts stack props. Since my app uses API GW with a 15 second timeout, I trigger the trigger this second lambda.

```typescript
import { randomUUID } from 'crypto';
import { App } from 'aws-cdk-lib';
import * as fs from 'fs-extra';
import {
  MyMiniAppStack,
  MyMiniAppStackProps,
} from '../../constructs/MyMiniAppStack';
import { exec } from '@lsw-apps/lsw-dev-util';

/**
 * Entry point for the deployer lambda
 */
export async function handler(childStackProps: MyMiniAppStackProps) {
  console.log('deploying', childStackProps);

  // Synthesize a Cloud Assembly somewhere in /tmp
  const assemblyDir = `/tmp/cdk.out.${randomUUID()}`;

  const app = new App({ outdir: assemblyDir });
  new MyMiniAppStack(app, 'MyMiniApp', childStackProps);
  app.synth();

  try {
    // Deploy the assembly
    await exec(
      `npx cdk deploy --app ${assemblyDir} --all --require-approval=never`,
      true
    );
  } finally {
    // Clean up.
    await fs.remove(assemblyDir);

    // TODO: Publish error to SNS topic?
  }
}
```

## Limitations

- Lambda has a 15 minute timeout. If you expect your app to take longer to run, you can use CodeBuild.
  - Alternatively, once CloudFormation has started deploying the changeset, you can kill the process and exit the lambda.
- You should add SNS notifications to the CloudFormation stack so that you can update your provisioning app with success/failure.

### Using Codebuild to Build the Deployer

Building a Docker container on a MacBook Pro is crazy slow. The following CodeBuild took ~5minutes to build the deployer image and deploy it.

```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  ComputeType,
  LinuxBuildImage,
  Project,
  Source,
} from 'aws-cdk-lib/aws-codebuild';
import { PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface CodeBuildStackProps extends StackProps {
  prefix: string;
  defaultBranch: string;
}
export class CodeBuildStack extends Stack {
  constructor(scope: Construct, id: string, props: CodeBuildStackProps) {
    const { prefix, defaultBranch } = props;
    super(scope, id, {
      stackName: prefix,
      ...props,
    });

    const project = new Project(this, 'Project', {
      // Have to manually add app credential in the UI
      source: Source.gitHub({
        owner: 'ibliskavka',
        repo: 'my-provisioning-app',
        branchOrRef: defaultBranch,
      }),
      projectName: prefix,
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        computeType: ComputeType.MEDIUM,
      },
      environmentVariables: {
        // This token is required to pull private npm packages from GH
        NPM_TOKEN: {
          type: BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: 'github-npm-token',
        },
      },
      buildSpec: BuildSpec.fromObject({
        version: 0.2,
        phases: {
          build: {
            commands: [
              'echo $NPM_TOKEN',
              'npm config set //npm.pkg.github.com/:_authToken=$NPM_TOKEN',
              'npm i',
              'npm run deploy:deployer', // Remember this script from earlier?
            ],
          },
        },
      }),
    });

    const { account, region } = Stack.of(this);
    // Allows CodeBuild to execute CDK commands
    project.addToRolePolicy(
      new PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [
          `arn:aws:iam::${account}:role/cdk-hnb659fds-deploy-role-${account}-${region}`,
          `arn:aws:iam::${account}:role/cdk-hnb659fds-image-publishing-role-${account}-${region}`,
          `arn:aws:iam::${account}:role/cdk-hnb659fds-file-publishing-role-${account}-${region}`,
        ],
      })
    );
  }
}
```
