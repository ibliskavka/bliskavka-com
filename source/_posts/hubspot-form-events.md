---
title: Track HubSpot Form Conversion
date: 2025-02-20 10:47:27
categories:
  - HowTo
tags:
  - HowTo
  - HubSpot
---

I was working a Google AdWords campaign for [Mind-Wellness.net](https://mind-wellness.net) and I wanted to track when a user submitted the contact form.

I generated the static site using [Hugo](https://gohugo.io/), and I am relying on HubSpot for the contact form.

Fortunately, [HubSpot Forms API](https://legacydocs.hubspot.com/docs/methods/forms/advanced_form_options) provides a `onFormSubmit` callback!

## Code Sample

```typescript
hbspt.forms.create({
  region: 'na1',
  portalId: 'TODO',
  formId: 'TODO',
  onFormSubmit: function ($form) {
    // Use gtag to track conversion
    gtag_report_conversion();
  },
});
```
