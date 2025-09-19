# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal/professional blog built with Hexo static site generator and deployed to AWS using CDK. The site combines content management through Hexo with AWS infrastructure for hosting and content delivery.

## Commands

### Development
- `npm start` - Start local development server on port 3000
- `npm run build` - Build the static site (cleans public directory and runs hexo generate)

### Content Management
- `npx hexo new post my-post -s my-post-slug` - Create a new blog post with custom slug
- Content is written in Markdown and stored in `source/_posts/`
- Page content (About, Contact) is in `source/` directory
- Templates for new content are in `scaffolds/` directory

### Deployment
- `npm run deploy` - Deploy CDK infrastructure (slow, full stack deployment)
- `npm run publish` - Fast deployment: build site and sync to S3, then invalidate CloudFront cache
- `npm run synth` - Synthesize CDK templates without deploying
- `npm run diff` - Show differences between deployed and local CDK code

### CDK Operations
- `npm run cdk` - Direct access to CDK CLI
- CDK app entry point: `cdk/index.ts`
- CDK configuration: `cdk.json`

## Architecture

### Static Site Generation (Hexo)
- **Engine**: Hexo 7.1.1 with Hueman theme
- **Content**: Markdown files in `source/_posts/` for blog posts
- **Output**: Static files generated to `public/` directory
- **Configuration**: `_config.yml` contains site settings, theme config, and plugin settings

### AWS Infrastructure (CDK)
- **Entry Point**: `cdk/index.ts` - Defines complete AWS stack
- **Domain**: bliskavka.com and www.bliskavka.com
- **Certificate**: Pre-existing ACM certificate referenced by ARN
- **Hosting**: S3 bucket with CloudFront distribution
- **DNS**: Route 53 hosted zone with A records pointing to CloudFront
- **Security**: WAF disabled to reduce costs, S3 bucket blocks public access
- **CloudFront Function**: `cdk/handler.js` handles URL rewriting (appends index.html to directory requests)

### Key Infrastructure Components
- **S3 Bucket**: `bliskavka-com-assets` - stores static site files
- **CloudFront**: CDN with custom domain and SSL certificate
- **Route 53**: DNS management for apex and www domains
- **CloudFront Function**: URL rewriting for clean URLs

## Content Structure

- `source/_posts/` - Blog posts in Markdown format
- `source/About/` - About page content
- `source/Contact/` - Contact page content
- `source/images/` - Image assets
- `themes/hueman/` - Theme files
- `public/` - Generated static site (build output)

## Configuration Files

- `_config.yml` - Hexo site configuration, theme settings, plugins
- `package.json` - Dependencies and npm scripts
- `cdk.json` - CDK app configuration
- `cdk/index.ts` - AWS infrastructure definition

## Deployment Strategy

The project uses a two-tier deployment approach:
1. **Infrastructure changes**: Use `npm run deploy` for CDK stack updates
2. **Content changes**: Use `npm run publish` for fast content-only deployments to S3 with CloudFront cache invalidation

The publish command requires AWS CLI with `lsw` profile configured for S3 sync and CloudFront invalidation operations.