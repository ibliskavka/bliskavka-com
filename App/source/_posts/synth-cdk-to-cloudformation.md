---
title: Synth CDK app to Portable CloudFormation (obsolete)
date: 2021-09-13 07:47:58
categories:
  - HowTo
tags:
  - AWS
  - CloudFormation
  - CDK
  - Consulting
  - DevOps
---

Update 2/7/2022: [Read Synth CDK app to Custom Bucket instead](/2022/02/07/synth-cdk-to-custom-bucket/).

Consulting requires you to work within the client's parameters. Some clients have internal standards, and want you to deliver your white-label CDK app as CloudFormation. Call me old fashioned but...

<!-- more -->

> I dont expect Apple to rewrite their products in TypeScript because that is my current favorite.

Joking aside, in consulting this is a pretty common ask, so you must be prepared to deal with it.

On a related note, some AWS Clients have compliance or security restrictions that make it very difficult to get CLI access to deploy using CDK.

Fortunately, you can synth CDK apps into plain old CloudFormation, package it to an S3 bucket, and deploy it from the CloudFormation web console.

## TL;DR;

[Check out the demo project on GitHub](https://github.com/ibliskavka/synth-cdk-to-cloudformation).

## Initial Product Stack

Our demo stack will create a bucket, and name it based on the account, region, and client name.

```typescript
interface MyProductProps extends StackProps {
  client: string;
}
export class MyProduct extends Stack {
  constructor(scope: Construct, id: string, props: MyProductProps) {
    super(scope, id);
    const bucketName = `${props.env.account}-${props.env.region}-${props.client}`;
    new Bucket(this, 'Bucket', {
      bucketName: bucketName
    });
  }
}
```

## The env Field

Typically you will pass an `env` field to your CDK stack props like this:

```typescript
const app = new cdk.App();
new MyProduct(app, 'my-product', {
  env: {
    account: '123456879123',
    region: 'us-east-1'
  },
  client: 'foo'
});
```

And its very easy to access account and region from props like this:

```typescript
const bucketName = `${props.env.account}-${props.env.region}-${props.client}`;
```

The synthesized template will look like this:

```yaml
BucketName: '123456789123-us-east-1-foo'
```

This is very intuitive and works great for CDK deploys, but _*IS NOT PORTABLE*_. The synthesized template will contain hard-code account and region values.

The above props are evaluated at `synth-time`. We want the account and region values to be evaluated at `deploy-time`.

### Introducing Stack.of()

In plain CloudFormation you wouldn't hard-code the account and region information, you would use pseudo-functions like: `!Ref AWS::AccountId` and `!Ref AWS::Region` which get evaluated at deploy time.

Lets rewrite our stack params and exclude the optional `env` field.

```typescript
const app = new cdk.App();
new MyProduct(app, 'my-product', {
  client: 'foo'
});
```

Also, lets rewrite our stack to use Stack.of when env is not available.

```typescript
export class MyProduct extends Stack {
  constructor(scope: Construct, id: string, props: MyProductProps) {
    super(scope, id);

    const stack = props.env || Stack.of(this);
    const bucketName = `${stack.account}-${stack.region}-${props.client}`;

    new Bucket(this, 'Bucket', {
      bucketName: bucketName
    });
  }
}
```

If you look at the synthesized CloudFormation template, the result should look familiar:

```yaml
BucketName: !Sub '${AWS::AccountId}-${AWS::Region}-foo'
```

Bonus: The above approach works whether `env` is passed in or not, so we should use it by default.

## CloudFormation Parameters and Tokens

The other major requirement for portable apps is CloudFormation Parameters. So far, we have passed in our `client` name as a string. This is very convenient for CDK deploys so we want to keep this format, but lets rewrite our stack to use CloudFormation parameters so that we can have a deploy-time parameter.

```typescript
export class MyProduct extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  // Separate build step from constructor to allow inheriting stack to add properties.
  protected build(props: MyProductProps){
    const stack = props.env || Stack.of(this);
    const bucketName =`${stack.account}-${stack.region}-${props.client}`;

    new Bucket(this, 'Bucket', {
      bucketName: bucketName,
    });
  }
}

export class MyPortableProduct extends MyProduct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Add CloudFormation parameter
    const client = new CfnParameter(this, 'Client', {
      type: 'String',
      description: 'Used for naming'
    });

    // Build the base stack, using the client parameter as a string token
    this.build({
      client: client.valueAsString
    })
  }
}
```

We just extended our product stack to make it portable, with just a slight modification in the base stack! If you were to synthesize `MyPortableStack`, your `bucketName` would look something like this:

```yaml
BucketName: !Sub '${AWS::AccountId}-${AWS::Region}-${Client}'
```

### Warning!

`valueAsString` generates a token. Tokens don't represent your data, so don't perform string manipulations or conditionals with tokens. I will cover how to deal with this in another post.

## Synthesizing a Template

So far we have been making our CDK app portable, but we want CDK to generate a plain CloudFormation template.

Create a new `bin/product.ts` file

```typescript
const app = new cdk.App();
new MyPortableProduct(app, 'my-product');

const output = app.synth();
const outStack = output.stacks[0];

const templatePath = path.resolve('./cdk.out/template.yaml')
fs.writeFileSync(templatePath, YAML.stringify(outStack.template));
```

Create a new synth script in `package.json`. Notice this script excludes metadata and version reporting, this is not required for plain CloudFormation and makes our output template a lot cleaner.

```json
{
  "scripts": {
    "synth:product" : "tsc && npx cdk --app 'npx ts-node --prefer-ts-exts bin/product.ts' --path-metadata false --version-reporting false synth --quiet"
  }
}
```

Run the script `npm run synth:product`

Your `cdk.out/template.yaml` should look like this:

```yaml
Parameters:
  Client:
    Type: String
    Description: Used for naming
Resources:
  Bucket83908E77:
    Type: AWS::S3::Bucket
    Properties:
      BucketName:
        Fn::Join:
          - ""
          - - Ref: AWS::AccountId
            - "-"
            - Ref: AWS::Region
            - "-"
            - Ref: Client
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
```

## CloudFormation Logical Ids

If you are upgrading an existing CloudFormation or SAM app to CDK, you will notice that the bucket logical id (`Bucket83908E77`) is auto-generated.

If our legacy template logical id was `Bucket`, this would force the bucket to be recreated if you updated the stack.

We must update the `build` step to use `overrideLogicalId` to specify our own logical id.

```typescript
const bucket = new Bucket(this, 'Bucket', {
  bucketName: bucketName
});
(bucket.node.defaultChild as CfnBucket).overrideLogicalId('Bucket');
```

Now the template has our expected logical id, and we can update our stack without losing our data.

```yaml
Parameters:
  Client:
    Type: String
    Description: Used for naming
Resources:
  Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName:
        Fn::Join:
          - ""
          - - Ref: AWS::AccountId
            - "-"
            - Ref: AWS::Region
            - "-"
            - Ref: Client
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
```

## Conclusion

This is a lot of extra work if you are building internal AWS apps, but if you are upgrading or building a product that will be installed in client accounts, you need the flexibility to support different deployment mechanisms.

Check out the [GitHub Repo](https://github.com/ibliskavka/synth-cdk-to-cloudformation) for full project setup.

__Next Week (9/20/2021)__: Building Portable CDK apps with AWS Lambda

![Me with a stray cat in Greece 2017](cat.png)