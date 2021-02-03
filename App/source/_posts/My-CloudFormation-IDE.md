---
title: My CloudFormation IDE
date: 2021-02-03 17:55:11
categories:
- HowTo
tags:
- AWS
- CloudFormation
- DevOps
---

Writing CloudFormation or SAM templates without by hand is very powerful, but can also be quite frustrating without a good IDE setup...

<!-- more -->

## VSCode CloudFormation Language Support

I develop my CloudFormation templates in Visual Studio Code with the help of the [redhat.vscode-yaml](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) extension.

You MUST add these custom tags to your vscode settings.json file get the best experience.

```json
{
  "yaml.customTags": [
      "!And sequence",
      "!If sequence",
      "!Not sequence",
      "!Equals sequence",
      "!Or sequence",
      "!FindInMap sequence",
      "!Base64",
      "!Cidr",
      "!Cidr sequence",
      "!Ref",
      "!Sub",
      "!GetAtt",
      "!GetAtt sequence",
      "!GetAZs",
      "!ImportValue",
      "!Select",
      "!Select sequence",
      "!Split sequence",
      "!Join sequence",
      "!Condition"
  ],
  "yaml.format.enable": true
}
```

## Prettier

Also check out [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to help format your code.

With YAML, whitespace MATTERS! Consistently formatted code in general helps you read/scan code quicker and makes code merges much easier.

## SAM Validate

Don't forget to add `sam validate` or `aws cloudformation validate-template` to your build step. I find that it only catches a few bugs, but it runs so quickly that its totally worth including.

## TL;DR;

Use VS Code with the YAML extension with custom tags. Add Prettier as a bonus.