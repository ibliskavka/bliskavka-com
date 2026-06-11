---
name: post
description: Create a new blog post draft. Use when the user wants to write a new blog post.
argument-hint: <topic>
---

# Create a Blog Post

Create a new blog post about: $ARGUMENTS

## Process

1. Read 2-3 random existing posts from `source/_posts/` to match the writing style
2. Generate a slug from the topic (lowercase, hyphens, concise)
3. Create the post file at `source/_posts/<slug>.md`
4. Run the `avoid-ai-writing` skill on the file to remove AI writing patterns
5. Present the cleaned draft to the user for feedback and iterate until they are happy with it

## Front Matter Format

```markdown
---
title: Post Title
date: YYYY-MM-DD HH:mm:ss
categories:
  - Category
tags:
  - Tag1
  - Tag2
---
```

## Writing Style

- First person, casual, direct — no corporate fluff or LinkedIn marketing-speak
- Short sentences, conversational tone
- Use `<!-- more -->` teaser break after 1-2 opening sentences
- The teaser should give enough context to be interesting on its own
- Keep posts concise — say what needs to be said, then stop
- Only add code blocks, links, or lists when they add real value
- Never end with a summary or "Why It Works" section — these read as AI-generated and just restate what was already said. If the post explains itself, let it end.

## Categories

Use one of the existing categories: `Career`, `HowTo`, or omit if purely informational.

## Ask the User

- If the post date is unclear, ask
- If the category is ambiguous, ask
- If you need more context to write a good post, ask
