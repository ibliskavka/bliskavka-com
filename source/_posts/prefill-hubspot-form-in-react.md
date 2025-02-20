---
title: Prefill a HubSpot Form in a React App
date: 2025-02-20 10:51:30
categories:
  - HowTo
tags:
  - HowTo
  - React
  - HubSpot
---

I have a React App with a HubSpot contact form. The user must be logged into submit the form so I wanted to prefill their email address.

Fortunately, [HubSpot Forms API](https://legacydocs.hubspot.com/docs/methods/forms/advanced_form_options) provides a `onFormReady` callback!

## Code Sample

```typescript
const HubSpotContactForm = () => {
  const { getClaims } = useAmplify();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    getClaims().then((d) => setEmail(d?.email));
  }, []);

  useEffect(() => {
    if (email) {
      const script = document.createElement('script');
      script.src = 'https://js.hsforms.net/forms/v2.js';
      document.body.appendChild(script);

      script.addEventListener('load', () => {
        const hbspt = (window as any).hbspt;
        if (hbspt) {
          hbspt.forms.create({
            portalId: 'TODO',
            formId: 'TODO',
            target: '#hubspotForm',
            onFormReady: function ($form: any) {
              const emailInput = $form[0];
              emailInput.value = email;
              emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            },
          });
        }
      });
    }
  }, [email]);

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Submit any questions or feedback here and we will get back to you shortly"
        >
          Contact Form
        </Header>
      }
    >
      <div id="hubspotForm"></div>
    </Container>
  );
};
```
