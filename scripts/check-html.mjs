import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".github",
  ".playwright-mcp",
  "blob-report",
  "node_modules",
  "playwright-report",
  "test-results"
]);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function collectFiles(directory, extension, results = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        collectFiles(path.join(directory, entry.name), extension, results);
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(extension)) {
      results.push(path.join(directory, entry.name));
    }
  }

  return results;
}

function getLineNumber(content, offset) {
  return content.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function decodeHtmlAttribute(value) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#34;/g, "\"")
    .replace(/&#x22;/gi, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getAttribute(tag, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*([\"'])([\\s\\S]*?)\\1`, "i");
  const quoted = tag.match(pattern);
  if (quoted) return decodeHtmlAttribute(quoted[2]);

  const unquotedPattern = new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i");
  const unquoted = tag.match(unquotedPattern);
  return unquoted ? decodeHtmlAttribute(unquoted[1]) : "";
}

function hasAttribute(tag, name) {
  return new RegExp(`\\b${name}(?:\\s*=|\\s|>|/)`, "i").test(tag);
}

function collectTags(content, tagName) {
  const tags = [];
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  let match;

  while ((match = pattern.exec(content))) {
    tags.push({
      tag: match[0],
      offset: match.index
    });
  }

  return tags;
}

function collectInlineBlocks(content, tagName) {
  const blocks = [];
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  let match;

  while ((match = pattern.exec(content))) {
    if (tagName === "script" && hasAttribute(match[1], "src")) {
      continue;
    }

    blocks.push({
      attributes: match[1],
      body: match[2],
      offset: match.index
    });
  }

  return blocks;
}

function findCsp(content) {
  for (const meta of collectTags(content, "meta")) {
    if (getAttribute(meta.tag, "http-equiv").toLowerCase() === "content-security-policy") {
      return {
        content: getAttribute(meta.tag, "content"),
        line: getLineNumber(content, meta.offset)
      };
    }
  }

  return null;
}

function getCspTokens(csp, directiveName) {
  const directives = new Map();

  for (const directive of csp.split(";")) {
    const parts = directive.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) continue;
    directives.set(parts[0].toLowerCase(), parts.slice(1));
  }

  return directives.get(directiveName) || directives.get("default-src") || [];
}

function hashInlineBody(body) {
  return crypto.createHash("sha256").update(body, "utf8").digest("base64");
}

function checkInlineHashes({ content, csp, htmlFile, failures, tagName, directiveName }) {
  const tokens = getCspTokens(csp.content, directiveName);
  const inlineBlocks = collectInlineBlocks(content, tagName);

  for (const block of inlineBlocks) {
    const hash = hashInlineBody(block.body);
    const token = `'sha256-${hash}'`;

    if (!tokens.includes(token)) {
      const line = getLineNumber(content, block.offset);
      failures.push(`${htmlFile}:${line} inline <${tagName}> missing CSP ${token}`);
    }
  }
}

function checkRequiredHeadMetadata(content, htmlFile, failures) {
  if (!/^<!doctype html>/i.test(content.trimStart())) {
    failures.push(`${htmlFile}:1 missing <!doctype html>`);
  }

  const htmlTag = content.match(/<html\b[^>]*>/i)?.[0] || "";
  if (!getAttribute(htmlTag, "lang")) {
    failures.push(`${htmlFile}:1 missing html lang attribute`);
  }

  if (!/<title>[^<\s][\s\S]*?<\/title>/i.test(content)) {
    failures.push(`${htmlFile}:1 missing non-empty <title>`);
  }

  const hasDescription = collectTags(content, "meta").some((meta) =>
    getAttribute(meta.tag, "name").toLowerCase() === "description" &&
    getAttribute(meta.tag, "content").trim()
  );
  if (!hasDescription) {
    failures.push(`${htmlFile}:1 missing meta description`);
  }

  const hasCanonical = collectTags(content, "link").some((link) =>
    getAttribute(link.tag, "rel").toLowerCase() === "canonical" &&
    getAttribute(link.tag, "href").trim()
  );
  if (!hasCanonical) {
    failures.push(`${htmlFile}:1 missing canonical link`);
  }

  const hasReferrer = collectTags(content, "meta").some((meta) =>
    getAttribute(meta.tag, "name").toLowerCase() === "referrer" &&
    getAttribute(meta.tag, "content").trim()
  );
  if (!hasReferrer) {
    failures.push(`${htmlFile}:1 missing referrer policy`);
  }
}

function checkImages(content, htmlFile, failures) {
  for (const image of collectTags(content, "img")) {
    const line = getLineNumber(content, image.offset);
    const requiredAttributes = ["alt", "width", "height", "loading", "decoding"];

    for (const attribute of requiredAttributes) {
      if (!hasAttribute(image.tag, attribute)) {
        failures.push(`${htmlFile}:${line} <img> missing ${attribute}`);
      }
    }
  }
}

function checkExternalLinkTargets(content, htmlFile, failures) {
  for (const anchor of collectTags(content, "a")) {
    if (getAttribute(anchor.tag, "target").toLowerCase() !== "_blank") {
      continue;
    }

    const relTokens = new Set(getAttribute(anchor.tag, "rel").toLowerCase().split(/\s+/).filter(Boolean));
    if (!relTokens.has("noopener") || !relTokens.has("noreferrer")) {
      const line = getLineNumber(content, anchor.offset);
      failures.push(`${htmlFile}:${line} target=\"_blank\" link missing rel=\"noopener noreferrer\"`);
    }
  }
}

function checkCsp(content, htmlFile, failures) {
  const csp = findCsp(content);
  if (!csp?.content) {
    failures.push(`${htmlFile}:1 missing Content-Security-Policy meta tag`);
    return;
  }

  checkInlineHashes({
    content,
    csp,
    htmlFile,
    failures,
    tagName: "script",
    directiveName: "script-src"
  });
  checkInlineHashes({
    content,
    csp,
    htmlFile,
    failures,
    tagName: "style",
    directiveName: "style-src"
  });

  for (const tagName of ["a", "div", "main", "section", "span"]) {
    for (const tag of collectTags(content, tagName)) {
      if (hasAttribute(tag.tag, "style")) {
        const line = getLineNumber(content, tag.offset);
        failures.push(`${htmlFile}:${line} inline style attribute should be moved to CSS`);
      }
    }
  }
}

const htmlFiles = collectFiles(rootDir, ".html")
  .sort((left, right) => left.localeCompare(right));
const failures = [];

for (const filePath of htmlFiles) {
  const relativePath = toPosixPath(path.relative(rootDir, filePath));
  const content = fs.readFileSync(filePath, "utf8");

  checkRequiredHeadMetadata(content, relativePath, failures);
  checkCsp(content, relativePath, failures);
  checkImages(content, relativePath, failures);
  checkExternalLinkTargets(content, relativePath, failures);
}

if (failures.length > 0) {
  console.error("HTML quality check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error(`\nChecked ${htmlFiles.length} HTML file(s).`);
  process.exit(1);
}

console.log(`HTML quality checks passed for ${htmlFiles.length} file(s).`);
