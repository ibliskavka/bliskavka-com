---
title: Dynamic AWS IAM Policies
date: 2024-03-02 07:00:34
categories:
  - HowTo
tags:
  - AWS
  - CDK
  - Connect
  - Security
---

We maintain a CloudFormation custom resource provider for Amazon Connect. The provider has grown organically, and as new features were added, the default role policy has become large.

The provider can do simple low-security tasks like `associateLambda`, or complex tasks like `createInstance`, which requires access to security-sensitive resources like `kms` and `iam`.

During a recent security review, we discovered that the same role policy was being used across all provider instances. This meant that if we used a low-security operation, such as `associateLambda`, the role would be granted access to high-security resources like `kms` and `iam`.

## Solution 1 - Inject a Pre-Built Role

For the current project, we resolved the issue by introducing an optional role prop. This allowed the developer to select specific IAM permissions.

```typescript
// PSEUDO-CODE

class ConnectProvider {
  role: IRole;

  constructor(props: {role?: IRole}){
    if(!props.role){
      // Configures the default (overly permissive) permissions
      this.role = new Role(...);
    } else {
      // Uses the injected role
      this.role = props.role;
    }

    // Custom resource handler
    this.handler = new Function(... {role: this.role})
  }
}

const role = new Role(...);
role.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'connect:AssociateLambdaFunction',
      'connect:DisassociateLambdaFunction'],
    resources: [instanceArn]
  })
);
const provider = new ConnectProvider({role});
provider.associateLambda(...)
```

### Pros

- We were able to quickly patch the current app

### Cons

- Each dependent app would have to be updated manually. We have A LOT!
- The app developer must know exactly which IAM permissions are required.

## Solution 2 - Dynamically Generate the Role

I updated the custom resource constructs to dynamically build up the policy based on which resources are used, so I could roll out the update in a backward-compatible way.

```typescript
// PSEUDO-CODE

class ConnectProvider {
  role: IRole;

  constructor(props: {role?: IRole}){
    if(!props.role){
      this.role = new Role(...);
    } else if (props.role instanceof Role){
      // Convert to IRole to avoid manipulating the role
      this.role = Role.fromArn(props.role.roleArn)
    } else {
      this.role = props.role;
    }

    // Custom resource handler
    this.handler = new Function(... {role: this.role})
  }

  // Users call helper functions to create the custom resource
  associateLambda(id, instanceArn, lambda){
    if(this.role instanceof Role){
      // Dynamically update self-managed role
      this.role.addToPrincipalPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'connect:AssociateLambdaFunction',
            'connect:DisassociateLambdaFunction'],
          resources: [instanceArn]
        })
      );
    }

    return new CustomResource({
      serviceToken: this.handler.functionArn,
      properties: {
        instanceArn,
        functionArn: lambda.functionArn
      }
    });
  }
}
```

### Pros

- No manual intervention is needed for dependent apps. Simply upgrade the NPM package and redeploy.

### Cons

- Resource deletion does not work properly.
  - If you had a custom resource like `associateLambda`, everything works fine because the role policy is updated before the resource is created.
  - But if you remove the custom resource in a future release, CloudFormation will update the role policy first (and remove the associated permission) before cleaning up the resource.
  - As a result, you encounter a permission error when cleaning up the `associateLambda` resource
- Circular dependencies
  - If you used the provider to `createInstance` and then used the instance ARN in another construct like `associateLambda` you will encounter a circular reference
  - Details
    - Invoke `createInstance` and get instance ARN
    - Invoke `associateLambda` using instance ARN
      - Instance ARN is used in the dynamic policy, resulting in a circular reference

## Solution 3 - Mix of both

In the end, I decided to use a combination of both solutions. I created a `ConnectProviderRoleBuilder` to make it easier for developers to build the role.

Additionally, I also updated the `ConnectProvider` to automatically use the builder if a role is not provided.

This means that we can update existing apps without any manual intervention. If the app encounters the issues described in Solution 2 during ongoing development, the team can use the `ConnectProviderRoleBuilder` to generate an appropriate role quickly.

```typescript
// PSEUDO-CODE

class ConnectProviderRoleBuilder {
  role: IRole;

  /**
    * Tracks if the provider was used to create an instance.
    * If so, we cannot limit role permissions to a specific instance
    * due to circular dependency.
    */
  private createdInstance: boolean = false;

  constructor(props: {existingRole?: IRole}){
    if(!props.role){
      this.role = new Role(...)
    } else if(props.role instanceof Role){
      // Ensures role is not manipulated by the builder
      this.role = Role.fromArn(props.existingRole.roleArn)
    } else {
      this.role = props.existingRole;
    }
  }

  /**
  * Create an instance ARN for permission filtering
  * If the provider was used to create the instance the ARN will be
  * `instance/*` to avoid circular dependency error
  * Assumes this provider will operate on a single instance.
  */
  instanceArn(instanceId: string): string {
    if (this.createdInstance) {
      // We can't reference the instanceId (circular ref)
      return `arn:aws:connect:${region}:${account}:instance/*`;
    } else {
      return `arn:aws:connect:${region}:${account}:instance/${instanceId}`;
    }
  }

  allow(actions, resources){
    if(this.role instanceof Role){
      // Only add permissions if the role is being managed by the construct.
      this.role.addToPrincipalPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions,
          resources
        })
      );
    }
  }

  // Helpers to add policy statements
  allowAssociateLambda(instanceId, ...functionArns){
    this.allow([
      'connect:AssociateLambdaFunction',
      'connect:DisassociateLambdaFunction'],
      [this.instanceArn(instanceId)]
    );

    // Update lambda resource policy to allow connect invoke

    // ...
  }
  allowCreateInstance(){
    this.createdInstance = true;
    this.allow(...)
    // ...
  }
  // ...
}

class ConnectProvider {
  builder: ConnectProviderRoleBuilder;
  role: IRole;
  constructor(props: {role?: IRole}){
    this.builder = new ConnectProviderRoleBuilder({role: props.role})
    this.role = this.builder.role;

    this.handler = new Function(... {role: this.role})
  }

  associateLambda(instanceId, lambda){
    this.builder.allowAssociateLambda(instanceId, lambda.functionArn)
    return new CustomResource({
      serviceToken: this.handler.functionArn,
      properties: {
        instanceId,
        functionArn: lambda.functionArn
      }
    })
  }
}

const myLambda: IFunction;

// Pre-build the role
const builder = new ConnectProviderRoleBuilder()
builder.allowAssociateLambda(instanceId, myLambda.functionArn)

const provider = new ConnectProvider({role: builder.role})
provider.associateLambda(instanceId, myLambda)
```

## Conclusion

The simplest solution would have been to simply force the developer to inject a role but it would have created unnecessary developer friction because:

- My app used to deploy fine, but now I have to manually create a new role.
- I have no idea what is happening under the hood and which permissions are required, resulting in even more friction.

This solution was certainly more work, but it solved the problem with the least effort from the downstream developers.

No, go build secure and elegant tools!
