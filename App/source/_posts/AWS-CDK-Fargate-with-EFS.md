---
title: Fargate with EFS CDK
date: 2021-10-21 17:55:11
categories:
- HowTo
tags:
- AWS
- CDK
- DevOps
---

I struggled WAY too long trying to sort out the permissions for EFS. Turns out, there are 2 layers. The IAM role, and the Posix permissions. Both throw a similar looking access denied. Finally!

<!-- more -->

Don't judge me on the single AZ. I am running a single task in Fargate and only need one instance.

```typescript
const {vpc, az, region, account} = props;

const fileSystem = new FileSystem(this, 'Efs', {
  vpc,
  performanceMode: PerformanceMode.GENERAL_PURPOSE,
  vpcSubnets: {
    subnetType: ec2.SubnetType.PUBLIC,
    onePerAz: true,
    availabilityZones: [az]
  }
});

const accessPoint = new AccessPoint(this, 'AccessPoint', {
  fileSystem: fileSystem,
});

const task = new ecs.FargateTaskDefinition(this, 'Task', {
  cpu: 256,
  memoryLimitMiB: 512
});

const volumeName = 'efs-volume';

task.addVolume({
  name: volumeName,
  efsVolumeConfiguration: {
    fileSystemId: fileSystem.fileSystemId,
    transitEncryption: 'ENABLED',
    authorizationConfig:{
      accessPointId: accessPoint.accessPointId,
      iam: 'ENABLED'
    }
  }
});

const container = task.addContainer('Container', {
  image: ecs.ContainerImage.fromAsset('./container'),
  portMappings: [{hostPort: 80, containerPort: 80}],
});

container.addMountPoints({
  containerPath: '/mount/data',
  sourceVolume: volumeName,
  readOnly: false
});

task.addToTaskRolePolicy(
  new iam.PolicyStatement({
    actions: [
      'elasticfilesystem:ClientRootAccess',
      'elasticfilesystem:ClientWrite',
      'elasticfilesystem:ClientMount',
      'elasticfilesystem:DescribeMountTargets'
    ],
    resources: [`arn:aws:elasticfilesystem:${region}:${account}:file-system/${fileSystem.fileSystemId}`]
  })
);

task.addToTaskRolePolicy(
  new iam.PolicyStatement({
    actions: ['ec2:DescribeAvailabilityZones'],
    resources: ['*']
  })
);
```

I hope this save someone a headache!

![Me with a stray cat in Greece 2017](cat.jpg)