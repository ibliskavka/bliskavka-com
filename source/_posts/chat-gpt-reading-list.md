---
title: My ChatGPT Reading List
date: 2023-06-17 14:57:50
categories:
  - Career
tags:
  - ChatGPT
  - Training
---

There has been a lot of HYPE at the office around AI and ChatGPT. Organizational leaders and clients are looking for the AI angle.

<!-- more -->

I usually don’t jump on the latest tech right away because there is just too much new stuff all the time! It’s been almost 4 months since ChatGPT 4 was released and having seen some very impressive examples, I am ready to jump in and learn something new.

I work in the Contact Center space, and we build voice and chat self-service bots for clients, so I have some vested interest in this technology.

## Reading List

### ChatGPT for Dummies - Pam Baker

I found this book to be an excellent introduction. It offered a good background in layman's terms and was very easy to follow. It's also very explicit about the limitations of the models. GPT is great at generating content, but it may be lies ;)

### Developing Apps with GPT-4 and Chat GPT - Oliveier Caelen and Marie-Alice Blete

This was a great follow-up to the "For Dummies" book. The authors dive deeper into the differences between the OpenAI models and how they affect pricing.

As a developer, I found the code samples useful. The authors showed examples of using `Completion` and `Insertion` commands and covered some cost control topics.

### The ChatGPT Gold Rush: Profiting from the AI Revolution Online: Prompt Engineering Mastery with ChatGPT - Mark Adelson

This book might be useful if you are looking to use ChatGPT to create a bunch of ChatGPT content for your blog.

The title looks like clickbait for a reason (it is). The book is full of lists that include a heading, and a small paragraph. Along with a list of tools and a prompt dump.

I felt like some sections were written by ChatGPT.

### Modern Generative AI with ChatGPT and OpenAI Models - Valentina Alto

This is my favorite book so far. It covers some history, ethics, and limitations. The book also has code and use case examples.

Chapter 10 had a use case which is right up my alley. Using an Azure OpenAI instance to analyze call center transcripts.

#### Prompt

```text
{{transcript}}
"Extract the following information from the above text:
Name and Surname
Reason for calling
Policy Number
Resolution
Initial Sentiment
Reason for Initial Sentiment
Final sentiment
Reason for final sentiment
Contact center improvement"
```

#### Output

![ChatGPT Output](./chat-gpt-call-center-analysis.png)

## What's Next?

I am going to read a few more books on the topic. Blogs and the internet may have more current content, but I like the curated feel of a book.

In the meantime, I'm making lists for potential Proof of Concepts. This technology is amazing.
