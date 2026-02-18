export type SnippetTagCategory =
  | "COMPONENT"
  | "STYLE"
  | "INTERACTION"
  | "LAYOUT"
  | "TECH"
  | "COLOR"
  | "USE_CASE";

export type SnippetTagOption = {
  name: string;
  category: SnippetTagCategory;
};

export const SNIPPET_TAG_GROUPS: {
  id: SnippetTagCategory;
  tags: string[];
}[] = [
  {
    id: "COMPONENT",
    tags: [
      "button",
      "button-group",
      "navbar",
      "sidebar",
      "footer",
      "hero",
      "section",
      "card",
      "pricing",
      "testimonial",
      "faq",
      "form",
      "input",
      "textarea",
      "select",
      "checkbox",
      "radio",
      "toggle",
      "login",
      "signup",
      "profile",
      "table",
      "pagination",
      "modal",
      "drawer",
      "dropdown",
      "tabs",
      "accordion",
      "alert",
      "toast",
      "badge",
      "tooltip",
      "breadcrumb",
      "stepper",
      "loading",
      "empty-state",
      "404",
    ],
  },
  {
    id: "STYLE",
    tags: [
      "minimal",
      "modern",
      "elegant",
      "bold",
      "soft",
      "flat",
      "glassmorphism",
      "neumorphism",
      "gradient",
      "outline",
      "filled",
      "shadow",
      "rounded",
      "dark",
      "light",
    ],
  },
  {
    id: "INTERACTION",
    tags: [
      "hover",
      "focus",
      "active",
      "micro-interaction",
      "transition",
      "animation",
      "loading-animation",
      "scroll-animation",
    ],
  },
  {
    id: "LAYOUT",
    tags: [
      "responsive",
      "mobile-first",
      "desktop-first",
      "grid",
      "flex",
      "centered",
      "split-layout",
      "full-width",
      "sticky",
      "fixed",
    ],
  },
  {
    id: "TECH",
    tags: [
      "html",
      "css",
      "javascript",
      "vanilla-js",
      "rtl",
      "accessibility",
      "aria",
      "form-validation",
      "localstorage",
    ],
  },
  {
    id: "COLOR",
    tags: [
      "primary",
      "secondary",
      "neutral",
      "red",
      "blue",
      "green",
      "purple",
      "orange",
      "gold",
      "black",
      "white",
    ],
  },
  {
    id: "USE_CASE",
    tags: [
      "landing-page",
      "dashboard",
      "ecommerce",
      "saas",
      "portfolio",
      "agency",
      "logistics",
      "travel",
      "car-rental",
      "booking",
    ],
  },
];

export function normalizeTagName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifySnippet(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "snippet";
}

export function buildSnippetHtml(params: { html: string; css: string; js: string }) {
  const html = params.html?.trim() ?? "";
  const css = params.css?.trim() ?? "";
  const js = params.js?.trim() ?? "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Snippet Preview</title>
    <style>
${css}
    </style>
  </head>
  <body>
${html}
    <script>
${js}
    </script>
  </body>
</html>`;
}
