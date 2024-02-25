# Change Log

Changes related to the repo/code/layouts. The blog content is self-documenting.

[keep a changelog](https://keepachangelog.com)

## 2024-02-25

- Convert app from SAM to CDK
  - Had to add a CloudFront function to automatically add index.html for subdomains
- Update Hexo dependencies
- Remove obsolete app pages
- Update the Google Analytics snippet.
- Add Atom Feed
  Problem: The generated feed uses relative image links, which does not render in aggregators
  - There is a setting in `hexo-renderer-marked` to turn on absolute image URLs, but it doesn't work. Maybe the `hueman` template is overriding it?

## 2023-07-12

Copied CDK-related blog posts back in. Can have a duplicate.

## 2023-06-29

- Added contact form.

## 2023-06-22

Moved CDK-related blog posts to Liandra Softworks blog
