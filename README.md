# bliskavka.com

A personal/professional blog using Hexo, as static site generator.

Deployed to AWS using CDK.

## Scripts

```bash
npm install

# Build the blog
npm run build

# Deploy CDK App (slow)
npm run deploy

# Build and publish to S3 (fast)
npm run publish

# Start local server
npm start

# Create a new post
npx hexo new post my-post -s my-post-slug
```
