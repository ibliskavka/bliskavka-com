# Change Log

Changes related to the repo/code/layouts. The blog content is self-documenting.

[keep a changelog](https://keepachangelog.com)

## 2024-07-09

- Noticed a spike in CloudFront and S3 usage ($26/mo). Popular objects seem to be recursive crawls.
- Turned off automatic 404 redirects to index.html. I think this was causing dumb crawlers to perform infinite crawl loops on the site.

## 2024-02-25

- Convert app from SAM to CDK
  - Had to add a CloudFront function to automatically add index.html for subdomains
- Update Hexo dependencies
- Remove obsolete app pages
- Update the Google Analytics snippet.
- Add Atom Feed

## 2023-07-12

Copied CDK-related blog posts back in. Can have a duplicate.

## 2023-06-29

- Added contact form.

## 2023-06-22

Moved CDK-related blog posts to Liandra Softworks blog
