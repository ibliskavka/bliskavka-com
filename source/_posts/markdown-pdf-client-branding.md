---
title: Beautiful Branded PDFs from Markdown
date: 2026-02-18 00:00:00
categories:
  - HowTo
tags:
  - Markdown
  - VSCode
  - Documentation
---

Client docs shouldn't look like a README.

<!-- more -->

I write a lot of technical documentation in Markdown — architecture docs, design proposals, runbooks. It's fast, version-controlled, and plays well with Mermaid diagrams. But when it's time to hand something to a client, a raw markdown export looks amateurish.

Here's how I now generate polished, branded PDFs without leaving VS Code.

## The Setup

Install the [Markdown Preview Enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) extension for VS Code. It renders Markdown in a live preview pane and can export to PDF via Chrome.

## Let Claude Generate the Stylesheet

Open a Claude Code session and ask it to generate a stylesheet based on the client's website:

> "Generate a Markdown Preview Enhanced stylesheet based on the branding at acmecorp.com. Save it to .crossnote/style.less"

Claude fetches the site, pulls the primary colors, fonts, and heading styles, and writes a stylesheet to `.crossnote/style.less` — the folder MPE uses for custom styles.

## Preview and Export

Open your Markdown file, open the MPE preview pane (`Ctrl+Shift+V`), and you'll see the document rendered in the client's colors. When you're ready, right-click in the preview pane and select **Export → PDF**.

You get a PDF with client-matching typography, colors, and properly rendered Mermaid diagrams.

## Per-Client Stylesheets

The `.crossnote` folder lives in the repo, so commit stylesheets per project or client:

```
.crossnote/
  style.less         ← active stylesheet
  acme-style.less
  globex-style.less
```

Swap stylesheets when switching projects. The whole team gets consistent, on-brand output.

[Download a sample PDF](markdown-pdf-client-branding.pdf)
