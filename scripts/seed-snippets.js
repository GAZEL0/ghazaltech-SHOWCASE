/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require("dotenv");

dotenv.config();
dotenv.config({ path: ".env.local", override: false });

const { randomUUID } = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const snippets = [
  {
    slug: "aurora-cta-button",
    title: "Aurora CTA Button",
    description: "Rounded gradient button with a soft glow and hover lift.",
    html: [
      "<div class=\"aurora-wrap\">",
      "  <button class=\"aurora-button\" type=\"button\">",
      "    Start your project",
      "    <span class=\"aurora-glow\" aria-hidden=\"true\"></span>",
      "  </button>",
      "</div>",
    ].join("\n"),
    css: [
      "* { box-sizing: border-box; }",
      "body {",
      "  margin: 0;",
      "  min-height: 100vh;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  background: #0b1020;",
      "  color: #e2e8f0;",
      "  font-family: \"Space Grotesk\", \"Segoe UI\", sans-serif;",
      "}",
      ".aurora-wrap {",
      "  padding: 24px;",
      "}",
      ".aurora-button {",
      "  position: relative;",
      "  overflow: hidden;",
      "  border: none;",
      "  border-radius: 999px;",
      "  padding: 14px 32px;",
      "  font-size: 16px;",
      "  font-weight: 600;",
      "  color: #0b1020;",
      "  background: linear-gradient(120deg, #5eead4, #38bdf8, #a5b4fc);",
      "  box-shadow: 0 12px 30px rgba(56, 189, 248, 0.35);",
      "  cursor: pointer;",
      "  transition: transform 0.2s ease, box-shadow 0.2s ease;",
      "}",
      ".aurora-button:hover {",
      "  transform: translateY(-2px);",
      "  box-shadow: 0 16px 40px rgba(56, 189, 248, 0.45);",
      "}",
      ".aurora-glow {",
      "  position: absolute;",
      "  inset: -40% 20% auto;",
      "  height: 140%;",
      "  background: radial-gradient(circle, rgba(255, 255, 255, 0.55), transparent 70%);",
      "  opacity: 0.6;",
      "  pointer-events: none;",
      "}",
    ].join("\n"),
    js: "",
    status: "PUBLISHED",
    tags: [
      { name: "button", category: "COMPONENT" },
      { name: "gradient", category: "STYLE" },
      { name: "rounded", category: "STYLE" },
      { name: "soft", category: "STYLE" },
      { name: "hover", category: "INTERACTION" },
      { name: "transition", category: "INTERACTION" },
      { name: "html", category: "TECH" },
      { name: "css", category: "TECH" },
      { name: "landing-page", category: "USE_CASE" },
    ],
  },
  {
    slug: "glass-tabs-card",
    title: "Glass Tabs Card",
    description: "Tabbed glass card with a simple vanilla JS switcher.",
    html: [
      "<div class=\"glass-card\">",
      "  <div class=\"glass-tabs\" role=\"tablist\">",
      "    <button class=\"glass-tab is-active\" type=\"button\" data-panel=\"starter\">Starter</button>",
      "    <button class=\"glass-tab\" type=\"button\" data-panel=\"growth\">Growth</button>",
      "    <button class=\"glass-tab\" type=\"button\" data-panel=\"scale\">Scale</button>",
      "  </div>",
      "  <div class=\"glass-panel is-active\" data-panel=\"starter\">",
      "    <h3>Starter</h3>",
      "    <p>Launch-ready layout, hero, and CTA.</p>",
      "    <strong>$19 / mo</strong>",
      "  </div>",
      "  <div class=\"glass-panel\" data-panel=\"growth\">",
      "    <h3>Growth</h3>",
      "    <p>Extra sections, motion accents, and support.</p>",
      "    <strong>$49 / mo</strong>",
      "  </div>",
      "  <div class=\"glass-panel\" data-panel=\"scale\">",
      "    <h3>Scale</h3>",
      "    <p>Full UI kit with dashboard-ready layouts.</p>",
      "    <strong>$99 / mo</strong>",
      "  </div>",
      "</div>",
    ].join("\n"),
    css: [
      "* { box-sizing: border-box; }",
      "body {",
      "  margin: 0;",
      "  min-height: 100vh;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.2), transparent 55%), #0b1020;",
      "  color: #e2e8f0;",
      "  font-family: \"Space Grotesk\", \"Segoe UI\", sans-serif;",
      "}",
      ".glass-card {",
      "  width: min(420px, 92vw);",
      "  padding: 20px;",
      "  border-radius: 24px;",
      "  border: 1px solid rgba(148, 163, 184, 0.25);",
      "  background: rgba(15, 23, 42, 0.78);",
      "  backdrop-filter: blur(18px);",
      "  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.45);",
      "}",
      ".glass-tabs {",
      "  display: flex;",
      "  gap: 8px;",
      "  flex-wrap: wrap;",
      "  margin-bottom: 16px;",
      "}",
      ".glass-tab {",
      "  border: 1px solid rgba(148, 163, 184, 0.3);",
      "  border-radius: 999px;",
      "  padding: 6px 14px;",
      "  background: rgba(15, 23, 42, 0.6);",
      "  color: inherit;",
      "  font-size: 12px;",
      "  font-weight: 600;",
      "  cursor: pointer;",
      "  transition: all 0.2s ease;",
      "}",
      ".glass-tab.is-active {",
      "  border-color: rgba(56, 189, 248, 0.7);",
      "  background: rgba(56, 189, 248, 0.18);",
      "  color: #bae6fd;",
      "}",
      ".glass-panel {",
      "  display: none;",
      "  border-radius: 16px;",
      "  padding: 16px;",
      "  background: rgba(2, 6, 23, 0.55);",
      "  border: 1px solid rgba(148, 163, 184, 0.2);",
      "}",
      ".glass-panel.is-active {",
      "  display: block;",
      "}",
      ".glass-panel h3 {",
      "  margin: 0 0 8px;",
      "  font-size: 18px;",
      "}",
      ".glass-panel p {",
      "  margin: 0 0 12px;",
      "  color: #94a3b8;",
      "  font-size: 13px;",
      "}",
      ".glass-panel strong {",
      "  font-size: 18px;",
      "  color: #f8fafc;",
      "}",
    ].join("\n"),
    js: [
      "const tabs = document.querySelectorAll(\".glass-tab\");",
      "const panels = document.querySelectorAll(\".glass-panel\");",
      "",
      "tabs.forEach((tab) => {",
      "  tab.addEventListener(\"click\", () => {",
      "    const target = tab.getAttribute(\"data-panel\");",
      "    tabs.forEach((item) => {",
      "      item.classList.toggle(\"is-active\", item === tab);",
      "    });",
      "    panels.forEach((panel) => {",
      "      panel.classList.toggle(\"is-active\", panel.getAttribute(\"data-panel\") === target);",
      "    });",
      "  });",
      "});",
    ].join("\n"),
    status: "PUBLISHED",
    tags: [
      { name: "card", category: "COMPONENT" },
      { name: "tabs", category: "COMPONENT" },
      { name: "glassmorphism", category: "STYLE" },
      { name: "shadow", category: "STYLE" },
      { name: "active", category: "INTERACTION" },
      { name: "transition", category: "INTERACTION" },
      { name: "responsive", category: "LAYOUT" },
      { name: "javascript", category: "TECH" },
      { name: "vanilla-js", category: "TECH" },
      { name: "saas", category: "USE_CASE" },
    ],
  },
];

async function ensureSchema() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SnippetStatus') THEN
        CREATE TYPE "SnippetStatus" AS ENUM ('DRAFT', 'PUBLISHED');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SnippetTagCategory') THEN
        CREATE TYPE "SnippetTagCategory" AS ENUM ('COMPONENT', 'STYLE', 'INTERACTION', 'LAYOUT', 'TECH', 'COLOR', 'USE_CASE');
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "FrontEndSnippet" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "slug" TEXT NOT NULL,
      "html" TEXT NOT NULL,
      "css" TEXT NOT NULL,
      "js" TEXT NOT NULL,
      "status" "SnippetStatus" NOT NULL DEFAULT 'DRAFT',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "FrontEndSnippet_slug_key"
    ON "FrontEndSnippet" ("slug");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SnippetTag" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "category" "SnippetTagCategory" NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "SnippetTag_name_category_key"
    ON "SnippetTag" ("name", "category");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "FrontEndSnippetTag" (
      "snippetId" TEXT NOT NULL,
      "tagId" TEXT NOT NULL,
      PRIMARY KEY ("snippetId", "tagId"),
      CONSTRAINT "FrontEndSnippetTag_snippetId_fkey"
        FOREIGN KEY ("snippetId") REFERENCES "FrontEndSnippet"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "FrontEndSnippetTag_tagId_fkey"
        FOREIGN KEY ("tagId") REFERENCES "SnippetTag"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `);
}

async function upsertSnippet(snippet) {
  const tagIds = [];
  for (const tag of snippet.tags) {
    const [row] = await prisma.$queryRaw`
      INSERT INTO "SnippetTag" ("id", "name", "category", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${tag.name}, CAST(${tag.category} AS "SnippetTagCategory"), NOW(), NOW())
      ON CONFLICT ("name", "category")
      DO UPDATE SET "updatedAt" = EXCLUDED."updatedAt"
      RETURNING "id"
    `;
    tagIds.push(row.id);
  }

  const [saved] = await prisma.$queryRaw`
    INSERT INTO "FrontEndSnippet" (
      "id", "title", "description", "slug", "html", "css", "js", "status", "createdAt", "updatedAt"
    ) VALUES (
      ${randomUUID()}, ${snippet.title}, ${snippet.description || null}, ${snippet.slug},
      ${snippet.html}, ${snippet.css}, ${snippet.js}, CAST(${snippet.status} AS "SnippetStatus"), NOW(), NOW()
    )
    ON CONFLICT ("slug")
    DO UPDATE SET
      "title" = EXCLUDED."title",
      "description" = EXCLUDED."description",
      "html" = EXCLUDED."html",
      "css" = EXCLUDED."css",
      "js" = EXCLUDED."js",
      "status" = EXCLUDED."status",
      "updatedAt" = EXCLUDED."updatedAt"
    RETURNING "id", "slug"
  `;

  await prisma.$executeRaw`
    DELETE FROM "FrontEndSnippetTag" WHERE "snippetId" = ${saved.id}
  `;

  for (const tagId of tagIds) {
    await prisma.$executeRaw`
      INSERT INTO "FrontEndSnippetTag" ("snippetId", "tagId")
      VALUES (${saved.id}, ${tagId})
      ON CONFLICT DO NOTHING
    `;
  }

  return saved;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Set it in .env.local before seeding.");
  }

  await ensureSchema();

  const results = [];
  for (const snippet of snippets) {
    const saved = await upsertSnippet(snippet);
    results.push({ slug: saved.slug, id: saved.id });
  }

  console.log("Seeded front-end snippets:", results);
}

main()
  .catch((error) => {
    console.error("Snippet seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
