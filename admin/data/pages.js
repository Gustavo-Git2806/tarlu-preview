window.TarluPagesSchema = {
  "meta": {
    "version": 1,
    "note": "Editable field schema for all public + hidden pages. Each field maps to a data-edit-key attribute in the corresponding HTML page. Admin edits are persisted to localStorage under key 'tarlu_edits_v1'."
  },
  "groups": [
    {
      "id": "public",
      "label": "Public pages",
      "pages": [
        {
          "slug": "index",
          "title": "Home",
          "file": "index.html",
          "visibility": "public",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Third-party logistics Â· UK & EU" },
            { "key": "hero.title", "label": "Hero heading (HTML allowed)", "type": "html-line", "default": "Scale your brand with <em>confidence.</em>" },
            { "key": "hero.lead", "label": "Hero lead paragraph", "type": "textarea", "default": "Precision fulfilment, human service. From storage to doorstep â€” for ambitious ecommerce brands." },
            { "key": "kpi.1.num", "label": "KPI 1 Â· number", "type": "text", "default": "15+" },
            { "key": "kpi.1.lbl", "label": "KPI 1 Â· label", "type": "text", "default": "Sectors served" },
            { "key": "kpi.2.num", "label": "KPI 2 Â· number", "type": "text", "default": "99.9%" },
            { "key": "kpi.2.lbl", "label": "KPI 2 Â· label", "type": "text", "default": "Order accuracy" },
            { "key": "kpi.3.num", "label": "KPI 3 Â· number", "type": "text", "default": "3PM" },
            { "key": "kpi.3.lbl", "label": "KPI 3 Â· label", "type": "text", "default": "Same-day cut-off" }
          ]
        },
        {
          "slug": "services",
          "title": "Services",
          "file": "services.html",
          "visibility": "public",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Our capabilities" },
            { "key": "hero.title", "label": "Hero heading (HTML allowed)", "type": "html-line", "default": "Complete fulfilment, <em>end to end.</em>" },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "We don't just store and ship â€” we add value at every stage of your supply chain." }
          ]
        },
        {
          "slug": "markets",
          "title": "Markets",
          "file": "markets.html",
          "visibility": "public",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Industries we power" },
            { "key": "hero.title", "label": "Hero heading (HTML allowed)", "type": "html-line", "default": "Trusted across <em>15+</em> sectors." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Flexible, reliable fulfilment shaped to the unique demands of your industry." }
          ]
        },
        {
          "slug": "contact",
          "title": "Contact",
          "file": "contact.html",
          "visibility": "public",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Get in touch" },
            { "key": "hero.title", "label": "Hero heading (HTML allowed)", "type": "html-line", "default": "Let's talk <em>fulfilment.</em>" },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Tell us about your brand. We'll come back with a tailored quote within one working day." },
            { "key": "contact.email", "label": "Contact email", "type": "text", "default": "enquiries@tarlu.com" },
            { "key": "contact.phone", "label": "Contact phone", "type": "text", "default": "+44 (0) 330 223 2218" },
            { "key": "contact.hours", "label": "Hours", "type": "text", "default": "Monâ€“Fri Â· 9am â€“ 5pm GMT" }
          ]
        }
      ]
    },
    {
      "id": "schedules",
      "label": "Pricing schedules",
      "pages": [
        {
          "slug": "advanced-pick-services",
          "title": "Advanced Pick Services",
          "file": "advanced-pick-services.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Pricing schedule" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Advanced pick services." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Transparent per-item pricing for heavier, oversized and tracked goods â€” no hidden fees, no surprises on your monthly invoice." },
            { "key": "meta.updated", "label": "Last updated (meta)", "type": "text", "default": "April 2026" }
          ]
        },
        {
          "slug": "advanced-pick-services-2026",
          "title": "Advanced Pick Services 2026",
          "file": "advanced-pick-services-2026.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Pricing schedule Â· 2026" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Advanced pick services for 2026." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "The 2026 rate card for heavier, oversized and tracked goods. Applies to contracts commencing on or after 1 January 2026." },
            { "key": "meta.effective", "label": "Effective date", "type": "text", "default": "1 January 2026" }
          ]
        },
        {
          "slug": "packing-fees",
          "title": "Packing Fees",
          "file": "packing-fees.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Pricing schedule" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Packing fees." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Transparent, competitive packaging fees â€” designed to fit your fulfilment needs without hidden costs." }
          ]
        },
        {
          "slug": "client-supplied-packaging",
          "title": "Client Supplied Packaging",
          "file": "client-supplied-packaging.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Client materials" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Client-supplied packaging." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Tarlu supports clients who prefer to supply their own packaging for branding purposes â€” with clear requirements and processing fees." },
            { "key": "setup.fee", "label": "Setup fee (aside)", "type": "text", "default": "Â£75.00" }
          ]
        },
        {
          "slug": "fulfilment-service-surcharges",
          "title": "Fulfilment Service Surcharges",
          "file": "fulfilment-service-surcharges.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Pricing schedule" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Fulfilment service surcharges." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Straightforward surcharges â€” transparent, competitive, and designed to support your business growth." }
          ]
        },
        {
          "slug": "fulfilment-service-surcharges-2026",
          "title": "Fulfilment Surcharges 2026",
          "file": "fulfilment-service-surcharges-2026.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Pricing schedule Â· 2026" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Fulfilment service surcharges 2026." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "The 2026 rate card, applied to contracts commencing on or after 1 January 2026. Straightforward, transparent, and reviewed each April." }
          ]
        }
      ]
    },
    {
      "id": "forms",
      "label": "Forms",
      "pages": [
        {
          "slug": "complete-enquiry-form",
          "title": "Complete Enquiry Form",
          "file": "complete-enquiry-form.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "New enquiry information" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Complete enquiry form." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Thank you for expressing an interest in Tarlu fulfilment services. To progress your application, please share the details below. We'll come back within one working day." }
          ]
        },
        {
          "slug": "complaints",
          "title": "Complaints & Feedback",
          "file": "complaints.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Client care" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Complaints &amp; feedback." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Something's gone wrong, or something could be better? Tell us in detail. Every submission is reviewed and answered within 10 working days." }
          ]
        },
        {
          "slug": "agency-request",
          "title": "Agency Request (internal)",
          "file": "agency-request.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Internal Â· operations" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Agency request." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Book additional agency labour hours against a client account. Please complete all fields â€” incomplete requests will be returned to the requester." },
            { "key": "meta.rate", "label": "Agency hourly rate", "type": "text", "default": "Â£20 per agency hour" }
          ]
        },
        {
          "slug": "client-mailing-list",
          "title": "Client Mailing List",
          "file": "client-mailing-list.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Stay informed" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Client mailing list." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "Pricing updates, service changes, seasonal cut-offs, integration news, and the occasional industry insight. No spam, no cross-promotion. One-click unsubscribe." }
          ]
        }
      ]
    },
    {
      "id": "legal",
      "label": "Legal",
      "pages": [
        {
          "slug": "fulfilment-terms-and-conditions",
          "title": "Terms & Conditions",
          "file": "fulfilment-terms-and-conditions.html",
          "visibility": "hidden",
          "fields": [
            { "key": "hero.eyebrow", "label": "Hero eyebrow", "type": "text", "default": "Legal" },
            { "key": "hero.title", "label": "Hero heading", "type": "html-line", "default": "Terms &amp; conditions for 3PL services." },
            { "key": "hero.lead", "label": "Hero lead", "type": "textarea", "default": "These are the standard conditions on which Tarlu Ltd supplies third-party logistics services. Governed by the laws of England and Wales." },
            { "key": "meta.company", "label": "Company details (meta)", "type": "text", "default": "Tarlu Ltd Â· Company no. 10080954" },
            { "key": "meta.jurisdiction", "label": "Jurisdiction (meta)", "type": "text", "default": "England & Wales" },
            { "key": "liability.cap", "label": "Total liability cap (clause 16.3)", "type": "text", "default": "Â£25,000" }
          ]
        }
      ]
    }
  ]
}
;
