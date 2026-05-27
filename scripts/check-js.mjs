import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".github",
  ".playwright-mcp",
  "node_modules"
]);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

const checkedExtensions = new Set([".js", ".mjs"]);

function collectFiles(directory, results = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        collectFiles(path.join(directory, entry.name), results);
      }
      continue;
    }

    if (entry.isFile() && checkedExtensions.has(path.extname(entry.name))) {
      results.push(path.join(directory, entry.name));
    }
  }

  return results;
}

const jsFiles = collectFiles(rootDir)
  .sort((left, right) => left.localeCompare(right));

if (!jsFiles.length) {
  console.log("No JavaScript files found.");
  process.exit(0);
}

let failures = 0;

for (const filePath of jsFiles) {
  const relativePath = toPosixPath(path.relative(rootDir, filePath));
  const result = spawnSync(process.execPath, ["--check", filePath], {
    encoding: "utf8"
  });

  if (result.status === 0) {
    console.log(`ok ${relativePath}`);
    continue;
  }

  failures += 1;
  console.error(`\nJavaScript syntax check failed: ${relativePath}`);
  if (result.stdout) console.error(result.stdout.trimEnd());
  if (result.stderr) console.error(result.stderr.trimEnd());
}

if (failures > 0) {
  console.error(`\n${failures} JavaScript file(s) failed syntax checks.`);
  process.exit(1);
}

console.log(`\nJavaScript syntax checks passed for ${jsFiles.length} file(s).`);
