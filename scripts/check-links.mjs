import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".github",
  ".playwright-mcp",
  "node_modules"
]);
const ignoredProtocols = new Set([
  "blob:",
  "data:",
  "http:",
  "https:",
  "mailto:",
  "tel:"
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

function isExternalOrIgnored(rawReference) {
  const value = rawReference.trim();
  if (!value || value.startsWith("//")) return true;

  try {
    const parsed = new URL(value);
    return ignoredProtocols.has(parsed.protocol);
  } catch {
    return false;
  }
}

function decodeUrlPath(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function splitReference(rawReference) {
  const trimmed = rawReference.trim();
  const hashIndex = trimmed.indexOf("#");
  const beforeHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const fragment = hashIndex >= 0 ? trimmed.slice(hashIndex + 1) : "";
  const queryIndex = beforeHash.indexOf("?");
  const pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;

  return {
    fragment,
    pathname: decodeUrlPath(pathname)
  };
}

function resolveLocalPath(fromHtmlFile, rawReference) {
  const { pathname } = splitReference(rawReference);

  if (!pathname) {
    return fromHtmlFile;
  }

  const baseDirectory = pathname.startsWith("/")
    ? rootDir
    : path.dirname(fromHtmlFile);
  const withoutLeadingSlash = pathname.replace(/^\/+/, "");
  const absolutePath = path.resolve(baseDirectory, withoutLeadingSlash);

  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
    return path.join(absolutePath, "index.html");
  }

  if (pathname.endsWith("/")) {
    return path.join(absolutePath, "index.html");
  }

  return absolutePath;
}

function isInsideRoot(absolutePath) {
  const relativePath = path.relative(rootDir, absolutePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function collectAnchors(htmlContent) {
  const anchors = new Set();
  const attributePattern = /\s(?:id|name)\s*=\s*(["'])(.*?)\1/gi;
  let match;

  while ((match = attributePattern.exec(htmlContent))) {
    anchors.add(match[2]);
  }

  return anchors;
}

function addReference(references, htmlFile, content, kind, rawReference, offset) {
  if (isExternalOrIgnored(rawReference)) return;

  references.push({
    from: htmlFile,
    kind,
    line: getLineNumber(content, offset),
    raw: rawReference.trim()
  });
}

function collectReferences(htmlFile, content) {
  const references = [];
  const attributePattern = /\b(?:href|src|action|poster)\s*=\s*(["'])(.*?)\1/gi;
  const srcsetPattern = /\bsrcset\s*=\s*(["'])(.*?)\1/gi;
  let match;

  while ((match = attributePattern.exec(content))) {
    addReference(references, htmlFile, content, "attribute", match[2], match.index);
  }

  while ((match = srcsetPattern.exec(content))) {
    const srcsetValue = match[2];
    for (const candidate of srcsetValue.split(",")) {
      const rawReference = candidate.trim().split(/\s+/)[0];
      if (rawReference) {
        addReference(references, htmlFile, content, "srcset", rawReference, match.index);
      }
    }
  }

  return references;
}

const htmlFiles = collectFiles(rootDir, ".html")
  .sort((left, right) => left.localeCompare(right));
const anchorCache = new Map();
const failures = [];
let checkedReferences = 0;

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, "utf8");
  const references = collectReferences(htmlFile, content);

  for (const reference of references) {
    const { fragment } = splitReference(reference.raw);
    const targetPath = resolveLocalPath(reference.from, reference.raw);
    const relativeFrom = toPosixPath(path.relative(rootDir, reference.from));
    const relativeTarget = toPosixPath(path.relative(rootDir, targetPath));

    if (!isInsideRoot(targetPath)) {
      failures.push(`${relativeFrom}:${reference.line} escapes repo root: ${reference.raw}`);
      continue;
    }

    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
      failures.push(`${relativeFrom}:${reference.line} missing target: ${reference.raw} -> ${relativeTarget}`);
      continue;
    }

    checkedReferences += 1;

    if (!fragment) continue;

    if (!targetPath.endsWith(".html")) {
      failures.push(`${relativeFrom}:${reference.line} has fragment for non-HTML target: ${reference.raw}`);
      continue;
    }

    if (!anchorCache.has(targetPath)) {
      anchorCache.set(targetPath, collectAnchors(fs.readFileSync(targetPath, "utf8")));
    }

    const normalizedFragment = decodeUrlPath(fragment);
    if (!anchorCache.get(targetPath).has(normalizedFragment)) {
      failures.push(`${relativeFrom}:${reference.line} missing anchor #${normalizedFragment} in ${relativeTarget}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Internal link check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error(`\nChecked ${checkedReferences} local reference(s) across ${htmlFiles.length} HTML file(s).`);
  process.exit(1);
}

console.log(`Internal link checks passed for ${checkedReferences} local reference(s) across ${htmlFiles.length} HTML file(s).`);
