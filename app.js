
/*
  EVENT REGISTRATION PORTAL — V5 FIXED
  Frontend prototype only.
  No real registration storage, authentication, or email service.
*/

(() => {
  "use strict";

  const STORE = "event-portal-demo-v2";
  const app = document.getElementById("app");

  if (!app) {
    console.error("Missing #app element in index.html");
    return;
  }

  // Declare utilities before creating default questions.
  const uid = () =>
    crypto.randomUUID?.() ||
    "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);

  const esc = value =>
    String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);

  const slugify = value =>
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

  const clone = value => JSON.parse(JSON.stringify(value));

  // --------------------------------------------------
  // SMART QUESTION LIBRARY
  // --------------------------------------------------

  const LIBRARY = {
    fullName: {
      label: "Full name (as per passport)",
      type: "text",
      required: true,
      category: "Basic Details"
    },
    email: {
      label: "Email address",
      type: "email",
      required: true,
      category: "Basic Details"
    },
    mobile: {
      label: "Mobile number (including country code)",
      type: "tel",
      required: true,
      category: "Basic Details"
    },
    preferredName: {
      label: "Preferred name",
      type: "text",
      category: "Basic Details"
    },
    company: {
      label: "Company name",
      type: "text",
      category: "Basic Details"
    },
    salutation: {
      label: "Salutation",
      type: "select",
      options: ["Mr", "Ms", "Mrs", "Mx"],
      category: "Basic Details"
    },
    nationality: {
      label: "Nationality",
      type: "text",
      category: "Passport & Travel"
    },
    dob: {
      label: "Date of birth",
      type: "date",
      category: "Passport & Travel"
    },
    passportNumber: {
      label: "Passport number",
      type: "text",
      category: "Passport & Travel"
    },
    passportIssue: {
      label: "Passport date of issue",
      type: "date",
      category: "Passport & Travel"
    },
    passportExpiry: {
      label: "Passport expiry date",
      type: "date",
      category: "Passport & Travel"
    },
    passportUpload: {
      label: "Passport image",
      type: "file",
      category: "Passport & Travel"
    },
    emergencyName: {
      label: "Emergency contact name",
      type: "text",
      category: "Emergency Contact"
    },
    emergencyRelationship: {
      label: "Relationship to emergency contact",
      type: "text",
      category: "Emergency Contact"
    },
    emergencyMobile: {
      label: "Emergency contact number",
      type: "tel",
      category: "Emergency Contact"
    },
    flight: {
      label: "Flight arrangement",
      type: "radio",
      options: [
        "Joining group flight",
        "Arranging my own flight"
      ],
      category: "Flight & Accommodation"
    },
    roomType: {
      label: "Preferred room type",
      type: "radio",
      options: [
        "Twin sharing",
        "Single room",
        "Other"
      ],
      category: "Flight & Accommodation"
    },
    roommate: {
      label: "Preferred roommate",
      type: "text",
      category: "Flight & Accommodation"
    },
    dietary: {
      label: "Dietary requirements",
      type: "select",
      options: [
        "No restrictions",
        "Vegetarian",
        "Halal",
        "No beef",
        "No seafood",
        "Other"
      ],
      category: "Meals & Activities"
    },
    allergies: {
      label: "Food allergies",
      type: "textarea",
      category: "Meals & Activities"
    },
    activity: {
      label: "Preferred activity",
      type: "radio",
      options: [
        "Option A",
        "Option B"
      ],
      category: "Meals & Activities"
    },
    accompanying: {
      label: "Will you bring an accompanying person?",
      type: "radio",
      options: ["Yes", "No"],
      category: "Accompanying Person"
    },
    guestName: {
      label: "Accompanying person's full name",
      type: "text",
      category: "Accompanying Person"
    },
    guestRelationship: {
      label: "Relationship to accompanying person",
      type: "text",
      category: "Accompanying Person"
    },
    consent: {
      label: "I acknowledge the information provided",
      type: "checkbox",
      options: ["I agree"],
      required: true,
      category: "Agreements"
    }
  };

  function fromLibrary(key) {
    const item = LIBRARY[key];
    if (!item) return null;

    return {
      id: uid(),
      libraryKey: key,
      label: item.label,
      type: item.type,
      required: !!item.required,
      options: [...(item.options || [])],
      capacities: [],
      category: item.category
    };
  }

  function basicQuestions() {
    return [
      fromLibrary("fullName"),
      fromLibrary("email"),
      fromLibrary("mobile")
    ];
  }

  const TEMPLATES = {
    basic: ["fullName", "email", "mobile"],
    travel: [
      "salutation",
      "preferredName",
      "company",
      "nationality",
      "dob",
      "passportNumber",
      "passportIssue",
      "passportExpiry",
      "passportUpload",
      "emergencyName",
      "emergencyRelationship",
      "emergencyMobile",
      "flight",
      "roomType",
      "roommate",
      "dietary",
      "allergies",
      "activity",
      "accompanying",
      "guestName",
      "guestRelationship",
      "consent"
    ]
  };

  // --------------------------------------------------
  // DEFAULT EVENTS
  // --------------------------------------------------

  function createEvent(name, slug, colour = "#24485b") {
    return {
      id: uid(),
      slug,
      name,
      subtitle: "",
      status: "draft",
      start: "",
      end: "",
      brand: {
        primary: colour,
        hero: "",
        mobileHero: ""
      },
      settings: {
        inviteOnly: false,
        verifyEmail: false,
        uniqueEmail: true,
        allowEdit: true
      },
      questions: basicQuestions()
    };
  }

  const defaults = [
    createEvent("Univers Convention 2027", "univers", "#1c5267"),
    createEvent("BOC Incentive Experience", "banca-boc", "#284f72"),
    createEvent("RHB Incentive Experience", "banca-rhb", "#8b2845"),
    createEvent("CIMB Incentive Experience", "banca-cimb", "#9a343b")
  ];

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE));
      if (saved && Array.isArray(saved.events)) return saved;
    } catch (error) {
      console.warn("Could not read saved configuration", error);
    }

    return { events: clone(defaults) };
  }

  let data = load();
  let currentId = data.events[0]?.id || null;
  let view = "dashboard";
  let tab = "branding";

  // Upgrade old events without resetting their existing forms.
  data.events.forEach(event => {
    event.brand ||= {};
    event.settings ||= {};
    event.questions ||= [];

    event.brand.primary ||= "#24485b";
    event.brand.hero ||= "";
    event.brand.mobileHero ||= "";

    // Preserve old questions; add missing core fields.
    const existing = event.questions.map(q =>
      (q.libraryKey || q.label || "").toLowerCase()
    );

    const missing = basicQuestions().filter(q => {
      const key = q.libraryKey.toLowerCase();
      if (existing.some(x => x.includes(key))) return false;

      if (key === "fullname" &&
          existing.some(x => x.includes("full name"))) return false;

      if (key === "email" &&
          existing.some(x => x.includes("email"))) return false;

      if (key === "mobile" &&
          existing.some(x =>
            x.includes("mobile") || x.includes("phone")
          )) return false;

      return true;
    });

    event.questions.unshift(...missing);
  });

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(data));
      return true;
    } catch (error) {
      alert("Browser storage is full. Try using smaller images.");
      return false;
    }
  }

  function currentEvent() {
    return data.events.find(e => e.id === currentId) ||
      data.events[0];
  }

  function go(path) {
    history.pushState({}, "", path);
    route();
  }

  function notify(message) {
    document.querySelector(".toast")?.remove();

    const element = document.createElement("div");
    element.className = "toast";
    element.textContent = message;

    document.body.append(element);
    setTimeout(() => element.remove(), 2800);
  }

  function field(label, control, hint = "") {
    return `
      <div class="field">
        <label>${esc(label)}</label>
        ${control}
        ${hint ? `<span class="hint">${esc(hint)}</span>` : ""}
      </div>
    `;
  }

  function input(value, key, type = "text") {
    return `
      <input
        type="${type}"
        value="${esc(value)}"
        data-key="${esc(key)}"
      >
    `;
  }

  // --------------------------------------------------
  // CMS LAYOUT
  // --------------------------------------------------

  function renderAdmin() {
    const titles = {
      dashboard: "Overview",
      events: "Events",
      editor: "Event Editor",
      guide: "Getting Started"
    };

    app.innerHTML = `
      <div class="shell">
        <aside class="sidebar">
          <div class="brand">
            eventflow
            <small>Portal Studio · V5</small>
          </div>

          <div class="nav">
            <button data-nav="dashboard"
              class="${view === "dashboard" ? "active" : ""}">
              Overview
            </button>

            <button data-nav="events"
              class="${view === "events" ? "active" : ""}">
              Events
            </button>

            <button data-nav="editor"
              class="${view === "editor" ? "active" : ""}">
              Event Editor
            </button>

            <button data-nav="guide"
              class="${view === "guide" ? "active" : ""}">
              Deployment Guide
            </button>
          </div>

          <div class="sidefoot">
            Frontend prototype<br>
            Browser-local configuration only
          </div>
        </aside>

        <main class="main">
          <div class="top">
            <div>
              <h1>${titles[view] || "Event Portal"}</h1>
              <div class="muted">
                Create and manage registration experiences.
              </div>
            </div>
            <span class="badge-demo">DEMO ONLY</span>
          </div>

          <div id="screen">
            ${
              view === "dashboard" ? dashboard() :
              view === "events" ? eventsPage() :
              view === "editor" ? editor(currentEvent()) :
              guide()
            }
          </div>

          <div class="footer">
            Do not collect real participant information in this prototype.
          </div>
        </main>
      </div>
    `;

    bindAdmin();
  }

  function dashboard() {
    return `
      <div class="grid3">
        <div class="panel">
          <div class="muted">Events configured</div>
          <div class="kpi">${data.events.length}</div>
        </div>

        <div class="panel">
          <div class="muted">Published settings</div>
          <div class="kpi">
            ${data.events.filter(e => e.status === "published").length}
          </div>
        </div>

        <div class="panel">
          <div class="muted">Real registrations</div>
          <div class="kpi">—</div>
          <div class="hint">Backend not connected</div>
        </div>
      </div>

      <div class="panel" style="margin-top:20px">
        <div class="toolbar">
          <h2>Event workspace</h2>
          <button class="btn" data-action="create">
            + New Event
          </button>
        </div>

        <div class="grid" style="margin-top:20px">
          ${data.events.map(eventCard).join("")}
        </div>
      </div>
    `;
  }

  function eventsPage() {
    return `
      <div class="toolbar" style="margin-bottom:20px">
        <div class="muted">
          Manage your event registration portals.
        </div>

        <button class="btn" data-action="create">
          + Create Event
        </button>
      </div>

      <div class="grid">
        ${data.events.map(eventCard).join("")}
      </div>
    `;
  }

  function eventCard(event) {
    const hero = event.brand.hero || "";

    return `
      <div class="panel event-card">
        <div class="cover"
          style="
            background-color:${esc(event.brand.primary)};
            ${hero ? `background-image:url('${esc(hero)}')` : ""}
          ">
        </div>

        <div class="content">
          <div class="row between">
            <h3>${esc(event.name)}</h3>
            <span class="pill ${event.status === "draft" ? "draft" : ""}">
              ${esc(event.status)}
            </span>
          </div>

          <div class="muted">/${esc(event.slug)}</div>

          <div class="row">
            <button class="btn small"
              data-edit="${esc(event.id)}">
              Edit
            </button>

            <button class="btn secondary small"
              data-preview="${esc(event.id)}">
              Preview
            </button>

            <button class="btn outline small"
              data-duplicate="${esc(event.id)}">
              Duplicate
            </button>

            <button class="btn danger small"
              data-delete-event="${esc(event.id)}">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------
  // EVENT EDITOR
  // --------------------------------------------------

  function editor(event) {
    if (!event) {
      return `
        <div class="empty">
          No events yet. Create your first event.
        </div>
        <button class="btn" data-action="create">Create Event</button>
      `;
    }

    const tabs = [
      ["branding", "Branding"],
      ["media", "Media Library"],
      ["form", "Form Builder"],
      ["access", "Access & Rules"],
      ["email", "Email Preview"],
      ["publish", "Publishing"]
    ];

    return `
      <div class="toolbar" style="margin-bottom:20px">
        <div>
          <h2>${esc(event.name)}</h2>
          <div class="muted">/${esc(event.slug)}</div>
        </div>

        <div class="row">
          <button class="btn outline small" data-action="preview">
            Preview Site
          </button>

          <button class="btn secondary small" data-action="export">
            Export JSON
          </button>
        </div>
      </div>

      <div class="tabs">
        ${tabs.map(([key, label]) => `
          <button data-tab="${key}"
            class="${tab === key ? "active" : ""}">
            ${label}
          </button>
        `).join("")}
      </div>

      ${
        tab === "branding" ? branding(event) :
        tab === "media" ? mediaLibrary(event) :
        tab === "form" ? formBuilder(event) :
        tab === "access" ? access(event) :
        tab === "email" ? emailPreview(event) :
        publishing(event)
      }
    `;
  }

  function branding(event) {
    return `
      <div class="grid">
        <section class="panel stack">
          <h2>Event Identity</h2>

          ${field("Event name", input(event.name, "name"))}

          ${field("Subtitle", input(event.subtitle, "subtitle"))}

          ${field(
            "URL slug",
            input(event.slug, "slug"),
            "Example: univers or banca-rhb"
          )}

          ${field(
            "Primary colour",
            input(event.brand.primary, "primary", "color")
          )}

          <div class="divider"></div>

          <h3>Key Visuals</h3>

          <p class="muted">
            Your event branding should be incorporated into the
            artwork itself. No separate logo is required.
          </p>

          ${field(
            "Desktop KV URL",
            input(event.brand.hero, "asset-hero"),
            "Recommended: 1920 × 800 px"
          )}

          ${field(
            "Mobile KV URL",
            input(event.brand.mobileHero, "asset-mobileHero"),
            "Recommended: 750 × 1000 px"
          )}

          <button class="btn secondary" data-tab="media">
            Manage Images
          </button>
        </section>

        <section class="panel">
          <h2>Live Preview</h2>
          ${previewHTML(event, true)}
        </section>
      </div>
    `;
  }

  function mediaLibrary(event) {
    const images = [
      ["hero", "Desktop Key Visual", "1920 × 800 px"],
      ["mobileHero", "Mobile Key Visual", "750 × 1000 px"]
    ];

    return `
      <div class="panel stack">
        <h2>Media Library</h2>

        <p class="notice">
          Images selected from your computer are preview-only.
          They are saved in this browser, not uploaded to Cloudflare.
          For public images, upload to GitHub and enter the asset URL.
        </p>

        <div class="media-grid">
          ${images.map(([key, label, dimensions]) => `
            <div class="media-item">
              <h3>${label}</h3>
              <div class="muted">${dimensions}</div>

              <div class="media-thumb">
                ${
                  event.brand[key]
                    ? `<img src="${esc(event.brand[key])}" alt="${label}">`
                    : "No image selected"
                }
              </div>

              <label class="media-upload">
                Select image for preview

                <input type="file"
                  accept="image/png,image/jpeg,image/webp"
                  data-image="${key}">
              </label>

              <div class="hint">
                PNG / JPG / WebP, maximum 500 KB for browser storage
              </div>

              ${field(
                "Public asset path",
                input(event.brand[key], "asset-" + key),
                `/assets/${event.slug}/hero-${
                  key === "hero" ? "desktop" : "mobile"
                }.webp`
              )}

              <button class="btn outline small"
                data-clear-image="${key}">
                Clear Image
              </button>
            </div>
          `).join("")}
        </div>

        <button class="btn" data-action="preview">
          Preview Event Page
        </button>
      </div>
    `;
  }

  // --------------------------------------------------
  // SMART FORM BUILDER
  // --------------------------------------------------

  function formBuilder(event) {
    const categories = [...new Set(
      Object.values(LIBRARY).map(item => item.category)
    )];

    return `
      <div class="stack">
        <section class="panel">
          <div class="toolbar">
            <div>
              <h2>Smart Form Builder</h2>
              <p class="muted">
                Add preconfigured questions or create your own.
              </p>
            </div>

            <button class="btn" data-action="add-question">
              + Custom Question
            </button>
          </div>

          <div class="row" style="margin-top:16px">
            <button class="btn secondary"
              data-template="basic">
              + Basic Details
            </button>

            <button class="btn secondary"
              data-template="travel">
              + Travel Registration Template
            </button>
          </div>
        </section>

        <section class="panel">
          <h2>Question Library</h2>

          <p class="muted">
            Choose from ready-made questions with predefined
            input types and options.
          </p>

          ${categories.map(category => `
            <div style="margin-top:22px">
              <div class="section-title">${esc(category)}</div>

              <div class="row" style="margin-top:12px">
                ${
                  Object.entries(LIBRARY)
                    .filter(([, item]) => item.category === category)
                    .map(([key, item]) => `
                      <button class="btn outline small"
                        data-library="${key}">
                        + ${esc(item.label)}
                      </button>
                    `).join("")
                }
              </div>
            </div>
          `).join("")}
        </section>

        <section class="panel">
          <h2>Registration Questions</h2>

          <p class="muted">
            ${event.questions.length} questions configured.
            Use the arrows to rearrange them.
          </p>

          <div class="stack">
            ${event.questions.map((q, index) =>
              questionEditor(q, index, event.questions.length)
            ).join("")}
          </div>
        </section>
      </div>
    `;
  }

  function questionEditor(q, index, total) {
    const types = [
      "text", "email", "tel", "number", "date",
      "textarea", "select", "radio", "checkbox",
      "file", "capacity"
    ];

    const hasOptions = [
      "select", "radio", "checkbox", "capacity"
    ].includes(q.type);

    return `
      <div class="question">
        <div class="question-head">
          <div>
            <strong>Question ${index + 1}</strong>
            <span class="muted"> · ${esc(q.type)}</span>
          </div>

          <div class="row">
            <button class="btn secondary small"
              data-move="${esc(q.id)}:-1"
              ${index === 0 ? "disabled" : ""}>
              ↑
            </button>

            <button class="btn secondary small"
              data-move="${esc(q.id)}:1"
              ${index === total - 1 ? "disabled" : ""}>
              ↓
            </button>

            <button class="btn danger small"
              data-delete-question="${esc(q.id)}">
              Remove
            </button>
          </div>
        </div>

        <div class="grid">
          ${field(
            "Question label",
            `<input value="${esc(q.label)}"
              data-qfield="${esc(q.id)}:label">`
          )}

          ${field(
            "Field type",
            `<select data-qfield="${esc(q.id)}:type">
              ${types.map(type => `
                <option value="${type}"
                  ${q.type === type ? "selected" : ""}>
                  ${type}
                </option>
              `).join("")}
            </select>`
          )}
        </div>

        ${
          hasOptions
            ? field(
                "Options (one per line)",
                `<textarea data-qfield="${esc(q.id)}:options">${
                  esc((q.options || []).join("\n"))
                }</textarea>`
              )
            : ""
        }

        ${
          q.type === "capacity"
            ? field(
                "Capacities (one number per line)",
                `<textarea data-qfield="${esc(q.id)}:capacities">${
                  esc((q.capacities || []).join("\n"))
                }</textarea>`,
                "Capacity enforcement requires a backend."
              )
            : ""
        }

        <label class="option">
          <input type="checkbox"
            data-qfield="${esc(q.id)}:required"
            ${q.required ? "checked" : ""}>
          Required field
        </label>
      </div>
    `;
  }

  // --------------------------------------------------
  // OTHER CMS TABS
  // --------------------------------------------------

  function access(event) {
    const options = [
      ["inviteOnly", "Invitation-only access"],
      ["verifyEmail", "Email OTP verification"],
      ["uniqueEmail", "One registration per email"],
      ["allowEdit", "Allow registration edits"]
    ];

    return `
      <div class="panel" style="max-width:760px">
        <h2>Access & Rules</h2>

        <p class="notice">
          These are configuration settings only.
          Access restrictions are not enforced in this prototype.
        </p>

        ${options.map(([key, label]) => `
          <label class="switchline">
            <strong>${label}</strong>
            <input type="checkbox"
              data-key="${key}"
              ${event.settings[key] ? "checked" : ""}>
          </label>
        `).join("")}
      </div>
    `;
  }

  function emailPreview(event) {
    return `
      <div class="panel" style="max-width:760px">
        <h2>Confirmation Email Preview</h2>

        <div class="muted">
          Subject: ${esc(event.name)} — Registration Confirmation
        </div>

        <div class="divider"></div>

        <h2>Registration Received</h2>

        <p>Hello [Participant Name],</p>

        <p>
          Thank you for registering for
          <strong>${esc(event.name)}</strong>.
        </p>

        <p>Registration ID: [Generated ID]</p>

        <p>Your selections: [Answers Summary]</p>

        <p class="notice">
          No real email will be sent until the backend is connected.
        </p>
      </div>
    `;
  }

  function publishing(event) {
    return `
      <div class="panel" style="max-width:760px">
        <h2>Publishing Settings</h2>

        ${field(
          "Registration opens",
          input(event.start, "start", "datetime-local")
        )}

        ${field(
          "Registration closes",
          input(event.end, "end", "datetime-local")
        )}

        ${field(
          "Status",
          `<select data-key="status">
            ${["draft", "published", "closed"].map(status => `
              <option value="${status}"
                ${event.status === status ? "selected" : ""}>
                ${status}
              </option>
            `).join("")}
          </select>`
        )}

        <p class="notice">
          These settings are for demonstration.
          The public preview is accessible regardless of status.
        </p>

        <button class="btn" data-action="preview">
          Preview Event
        </button>
      </div>
    `;
  }

  function guide() {
    return `
      <div class="panel stack">
        <h2>Getting Started</h2>

        <p>1. Create an event or select an existing one.</p>
        <p>2. Configure the desktop and mobile KVs.</p>
        <p>3. Add questions using the Smart Question Library.</p>
        <p>4. Preview the participant registration page.</p>
        <p>5. Export your event configuration for backup.</p>

        <div class="notice">
          CMS data is stored only in your current browser.
          This is not a secure production registration system.
        </div>

        <button class="btn secondary" data-action="export-all">
          Export All Event Configurations
        </button>
      </div>
    `;
  }

  // --------------------------------------------------
  // PARTICIPANT PREVIEW
  // --------------------------------------------------

  function previewHTML(event, compact = false) {
    const desktop = event.brand.hero;
    const mobile = event.brand.mobileHero || desktop;

    return `
      <div class="previewframe ${compact ? "compact" : ""}">
        <section class="banner"
          style="
            background:${esc(event.brand.primary)};
            min-height:0;
            padding:0;
            display:block;
          ">

          ${
            desktop
              ? `<picture style="display:block;width:100%">
                  <source media="(max-width:650px)"
                    srcset="${esc(mobile)}">

                  <img src="${esc(desktop)}"
                    alt="${esc(event.name)} key visual"
                    style="
                      display:block;
                      width:100%;
                      height:auto;
                      object-fit:contain;
                    ">
                </picture>`
              : `<div style="
                  min-height:260px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  padding:30px;
                  color:white;
                  text-align:center;
                ">
                  <div>
                    <h2>${esc(event.name)}</h2>
                    <p>Upload your event key visual</p>
                  </div>
                </div>`
          }
        </section>

        <div class="public-inner">
          <div class="section-title">Registration</div>

          <h2 class="registration-heading">
            Register for ${esc(event.name)}
          </h2>

          ${
            compact
              ? `<div class="empty">
                  ${event.questions.length} configured questions
                </div>`
              : questionsHTML(event)
          }
        </div>
      </div>
    `;
  }

  function questionsHTML(event) {
    return `
      <form id="registration-form">
        ${event.questions.map(q => {
          const id = "field-" + esc(q.id);
          const required = q.required ? "required" : "";
          let control = "";

          if (["text", "email", "tel", "number", "date"]
              .includes(q.type)) {
            control = `
              <input id="${id}"
                name="${esc(q.id)}"
                type="${q.type}"
                ${required}>
            `;
          } else if (q.type === "textarea") {
            control = `
              <textarea id="${id}"
                name="${esc(q.id)}"
                ${required}></textarea>
            `;
          } else if (q.type === "file") {
            control = `
              <input id="${id}"
                type="file"
                ${required}
                accept=".pdf,.png,.jpg,.jpeg">

              <span class="hint">
                Demo only — files are not uploaded.
              </span>
            `;
          } else if (
            q.type === "select" || q.type === "capacity"
          ) {
            control = `
              <select id="${id}"
                name="${esc(q.id)}"
                ${required}>
                <option value="">Select an option</option>

                ${(q.options || []).map(option => `
                  <option value="${esc(option)}">
                    ${esc(option)}
                  </option>
                `).join("")}
              </select>
            `;
          } else if (
            q.type === "radio" || q.type === "checkbox"
          ) {
            control = (q.options || []).map((option, index) => `
              <label class="option">
                <input
                  type="${q.type}"
                  name="${esc(q.id)}"
                  value="${esc(option)}"
                  ${
                    q.type === "radio" &&
                    q.required &&
                    index === 0 ? "required" : ""
                  }>
                ${esc(option)}
              </label>
            `).join("");
          }

          return `
            <div class="field">
              <label for="${id}">
                ${esc(q.label)}
                ${q.required ? "*" : ""}
              </label>
              ${control}
            </div>
          `;
        }).join("")}

        <div class="divider"></div>

        <button class="btn" type="submit">
          Preview Confirmation
        </button>

        <p class="hint">
          No registration is saved or transmitted.
        </p>
      </form>
    `;
  }

  function renderPublic(event) {
    if (!event) {
      app.innerHTML = `
        <div class="public-inner" style="padding:40px">
          <h1>Event not found</h1>
          <button class="btn" id="backcms">
            Back to CMS
          </button>
        </div>
      `;

      document.getElementById("backcms").onclick =
        () => go("/admin");

      return;
    }

    app.innerHTML = `
      <div class="public-head">
        <span class="badge-demo">PREVIEW — NOT LIVE</span>

        <button class="btn secondary small" id="backcms">
          ← Back to CMS
        </button>
      </div>

      <div class="public">
        ${previewHTML(event)}
      </div>
    `;

    document.getElementById("backcms").onclick = () => {
      currentId = event.id;
      view = "editor";
      go("/admin");
    };

    document.getElementById("registration-form")
      ?.addEventListener("submit", e => {
        e.preventDefault();

        app.querySelector(".public-inner").innerHTML = `
          <div style="text-align:center;padding:50px 20px">
            <h2>Registration Preview Complete</h2>

            <p class="notice success">
              Demo only. No information was saved,
              no capacity was reserved and no email was sent.
            </p>

            <button class="btn" id="restart">
              Back to Form
            </button>
          </div>
        `;

        document.getElementById("restart").onclick =
          () => renderPublic(event);
      });
  }

  // --------------------------------------------------
  // CMS INTERACTIONS
  // --------------------------------------------------

  function bindAdmin() {
    app.querySelectorAll("[data-nav]").forEach(button => {
      button.onclick = () => {
        view = button.dataset.nav;
        history.pushState({}, "", "/admin");
        renderAdmin();
      };
    });

    app.querySelectorAll("[data-edit]").forEach(button => {
      button.onclick = () => {
        currentId = button.dataset.edit;
        view = "editor";
        tab = "branding";
        renderAdmin();
      };
    });

    app.querySelectorAll("[data-preview]").forEach(button => {
      button.onclick = () => {
        const event = data.events.find(
          e => e.id === button.dataset.preview
        );
        if (event) go("/" + event.slug);
      };
    });

    app.querySelectorAll("[data-duplicate]").forEach(button => {
      button.onclick = () => duplicateEvent(button.dataset.duplicate);
    });

    app.querySelectorAll("[data-delete-event]").forEach(button => {
      button.onclick = () => deleteEvent(button.dataset.deleteEvent);
    });

    app.querySelectorAll("[data-tab]").forEach(button => {
      button.onclick = () => {
        tab = button.dataset.tab;
        view = "editor";
        renderAdmin();
      };
    });

    app.querySelectorAll("[data-action]").forEach(button => {
      button.onclick = () => action(button.dataset.action);
    });

    app.querySelectorAll("[data-key]").forEach(element => {
      element.onchange = () => {
        const event = currentEvent();
        const key = element.dataset.key;
        const value = element.type === "checkbox"
          ? element.checked
          : element.value;

        if (key in event.settings) {
          event.settings[key] = value;
        } else if (key === "primary") {
          event.brand.primary = value;
        } else if (key.startsWith("asset-")) {
          event.brand[key.slice(6)] = value;
        } else if (key === "slug") {
          const slug = slugify(value);

          if (
            !slug ||
            ["admin", "api", "index.html"].includes(slug) ||
            data.events.some(e =>
              e.id !== event.id && e.slug === slug
            )
          ) {
            notify("Invalid or duplicate event URL");
            renderAdmin();
            return;
          }

          event.slug = slug;
        } else {
          event[key] = value;
        }

        save();
        renderAdmin();
      };
    });

    app.querySelectorAll("[data-image]").forEach(element => {
      element.onchange = () => {
        const file = element.files?.[0];
        if (!file) return;

        if (
          !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
          file.size > 500000
        ) {
          notify("Use PNG, JPG or WebP under 500 KB");
          return;
        }

        const reader = new FileReader();

        reader.onload = () => {
          const event = currentEvent();
          const key = element.dataset.image;
          const previous = event.brand[key];

          event.brand[key] = reader.result;

          if (!save()) {
            event.brand[key] = previous;
            return;
          }

          renderAdmin();
        };

        reader.readAsDataURL(file);
      };
    });

    app.querySelectorAll("[data-clear-image]").forEach(button => {
      button.onclick = () => {
        currentEvent().brand[button.dataset.clearImage] = "";
        save();
        renderAdmin();
      };
    });

    app.querySelectorAll("[data-library]").forEach(button => {
      button.onclick = () => {
        const question = fromLibrary(button.dataset.library);
        if (!question) return;

        currentEvent().questions.push(question);
        save();
        renderAdmin();
        notify("Question added");
      };
    });

    app.querySelectorAll("[data-template]").forEach(button => {
      button.onclick = () => {
        const keys = TEMPLATES[button.dataset.template] || [];
        const event = currentEvent();

        const existing = new Set(
          event.questions.map(q => q.libraryKey).filter(Boolean)
        );

        keys.forEach(key => {
          if (!existing.has(key)) {
            event.questions.push(fromLibrary(key));
          }
        });

        save();
        renderAdmin();
        notify("Template questions added");
      };
    });

    app.querySelectorAll("[data-qfield]").forEach(element => {
      element.onchange = () => {
        const [id, key] = element.dataset.qfield.split(":");
        const question = currentEvent().questions.find(
          q => q.id === id
        );

        if (!question) return;

        if (key === "required") {
          question.required = element.checked;
        } else if (key === "options") {
          question.options = element.value
            .split("\n")
            .map(s => s.trim())
            .filter(Boolean);
        } else if (key === "capacities") {
          question.capacities = element.value
            .split("\n")
            .map(s => Math.max(0, parseInt(s, 10) || 0));
        } else {
          question[key] = element.value;
        }

        save();
        renderAdmin();
      };
    });

    app.querySelectorAll("[data-delete-question]").forEach(button => {
      button.onclick = () => {
        if (!confirm("Remove this question?")) return;

        const event = currentEvent();
        event.questions = event.questions.filter(
          q => q.id !== button.dataset.deleteQuestion
        );

        save();
        renderAdmin();
      };
    });

    app.querySelectorAll("[data-move]").forEach(button => {
      button.onclick = () => {
        const [id, direction] = button.dataset.move.split(":");
        const questions = currentEvent().questions;
        const index = questions.findIndex(q => q.id === id);
        const target = index + Number(direction);

        if (index < 0 || target < 0 || target >= questions.length) {
          return;
        }

        [questions[index], questions[target]] =
          [questions[target], questions[index]];

        save();
        renderAdmin();
      };
    });
  }

  function action(name) {
    if (name === "create") {
      const name = prompt("Event name:", "New Event");
      if (!name?.trim()) return;

      const base = slugify(name) || "new-event";
      let slug = base;
      let index = 2;

      while (data.events.some(e => e.slug === slug)) {
        slug = base + "-" + index++;
      }

      const event = createEvent(name.trim(), slug);
      data.events.push(event);

      currentId = event.id;
      view = "editor";
      tab = "branding";

      save();
      renderAdmin();
    }

    if (name === "add-question") {
      currentEvent().questions.push({
        id: uid(),
        label: "New question",
        type: "text",
        required: false,
        options: [],
        capacities: []
      });

      save();
      renderAdmin();
    }

    if (name === "preview") {
      go("/" + currentEvent().slug);
    }

    if (name === "export") {
      downloadJSON(
        currentEvent(),
        currentEvent().slug + ".json"
      );
    }

    if (name === "export-all") {
      downloadJSON(data, "event-configurations.json");
    }
  }

  function duplicateEvent(id) {
    const source = data.events.find(e => e.id === id);
    if (!source) return;

    const copy = clone(source);
    copy.id = uid();
    copy.name += " (Copy)";
    copy.status = "draft";

    const base = source.slug + "-copy";
    copy.slug = base;

    let index = 2;
    while (data.events.some(e => e.slug === copy.slug)) {
      copy.slug = base + "-" + index++;
    }

    copy.questions.forEach(q => q.id = uid());

    data.events.push(copy);
    currentId = copy.id;
    view = "editor";
    tab = "branding";

    save();
    renderAdmin();
  }

  function deleteEvent(id) {
    const event = data.events.find(e => e.id === id);
    if (!event) return;

    const answer = prompt(
      `Delete "${event.name}"?\n\n` +
      `Type "${event.slug}" to confirm deletion.`
    );

    if (answer !== event.slug) {
      if (answer !== null) notify("Deletion cancelled");
      return;
    }

    data.events = data.events.filter(e => e.id !== id);

    if (currentId === id) {
      currentId = data.events[0]?.id || null;
    }

    save();
    view = "events";
    renderAdmin();
    notify("Event deleted from this browser");
  }

  function downloadJSON(value, filename) {
    const blob = new Blob(
      [JSON.stringify(value, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // --------------------------------------------------
  // ROUTING
  // --------------------------------------------------

  function route() {
    const path = decodeURIComponent(location.pathname)
      .replace(/^\/+|\/+$/g, "");

    if (path && path !== "admin" && path !== "index.html") {
      const event = data.events.find(e => e.slug === path);
      renderPublic(event);
      return;
    }

    view = path === "admin" ? "events" : "dashboard";
    renderAdmin();
  }

  window.addEventListener("popstate", route);

  // Start the application.
  route();

})();
