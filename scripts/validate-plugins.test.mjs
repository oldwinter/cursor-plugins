import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  analyzeSource,
  loadJson,
  validateAgainstSchema,
  validateComponentIntegrity,
  validateEntryUniqueness,
  validateOrphanManifests,
  validateReadmeIndex,
  validateVersion,
} from "./validate-plugins-lib.mjs";

function temporaryRoot(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

function write(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

test("malformed JSON becomes a contextual validation error", () => {
  const root = temporaryRoot("cursor-json-");
  const path = join(root, "broken.json");
  write(path, "{not-json");
  const errors = [];
  assert.equal(loadJson(path, "plugin/broken.json", errors.push.bind(errors)), null);
  assert.match(errors.join("\n"), /plugin\/broken\.json: invalid JSON/);
});

test("duplicate marketplace names and sources are rejected", () => {
  const errors = [];
  validateEntryUniqueness(
    [
      { name: "alpha", source: "one" },
      { name: "alpha", source: "two" },
      { name: "bravo", source: "two" },
    ],
    errors.push.bind(errors)
  );
  assert.match(errors.join("\n"), /duplicate name "alpha"/);
  assert.match(errors.join("\n"), /duplicate source "two"/);
});

test("source handling rejects escapes and accepts remote URLs", () => {
  const root = temporaryRoot("cursor-source-");
  const outside = temporaryRoot("cursor-outside-");
  symlinkSync(outside, join(root, "linked-outside"));

  assert.match(analyzeSource(root, "../outside").error, /escapes/);
  assert.match(analyzeSource(root, resolve(outside)).error, /escapes/);
  assert.match(analyzeSource(root, "C:\\outside").error, /escapes/);
  assert.match(analyzeSource(root, "linked-outside").error, /outside/);
  assert.equal(
    analyzeSource(root, "https://example.com/plugin.git").kind,
    "remote"
  );
});

test("orphan manifests are detected while dependency trees are ignored", () => {
  const root = temporaryRoot("cursor-orphan-");
  const registered = join(root, "alpha/.cursor-plugin/plugin.json");
  const orphan = join(root, "bravo/.cursor-plugin/plugin.json");
  write(registered, "{}");
  write(orphan, "{}");
  write(join(root, "node_modules/ignored/.cursor-plugin/plugin.json"), "{}");
  const errors = [];
  validateOrphanManifests(root, new Set([registered]), errors.push.bind(errors));
  assert.equal(errors.length, 1);
  assert.match(errors[0], /bravo\/\.cursor-plugin\/plugin\.json/);
});

test("component paths and frontmatter stay inside the plugin", () => {
  const root = temporaryRoot("cursor-components-");
  write(join(root, "skills/broken/SKILL.md"), "# Missing frontmatter\n");
  const errors = [];
  validateComponentIntegrity(
    root,
    {
      skills: "./missing-skills/",
      logo: "C:\\logo.svg",
      mcpServers: "./missing-mcp.json",
    },
    "plugin.json",
    errors.push.bind(errors)
  );
  const output = errors.join("\n");
  assert.match(output, /skills: path does not match.*missing-skills/);
  assert.match(output, /logo: path escapes/);
  assert.match(output, /mcpServers: path does not match.*missing-mcp/);
  assert.match(output, /skills\/broken\/SKILL\.md: missing YAML frontmatter/);
});

test("plugin versions require strict semantic versions", () => {
  const errors = [];
  validateVersion(
    { version: "1.2.3-beta.1" },
    "plugin.json",
    errors.push.bind(errors)
  );
  assert.deepEqual(errors, []);
  validateVersion({ version: "latest" }, "plugin.json", errors.push.bind(errors));
  assert.match(errors[0], /strict semantic version/);
});

test("README rows match marketplace order and metadata", () => {
  const tick = "\x60";
  const readme =
    "| " +
    tick +
    "alpha" +
    tick +
    " | [Alpha](alpha/) | Cursor | Utilities | stale |\n";
  const entries = [
    { name: "alpha", source: "alpha", description: "Fresh" },
    { name: "bravo", source: "bravo", description: "Second" },
  ];
  const manifests = new Map([
    [
      "alpha",
      {
        displayName: "Alpha",
        author: { name: "Cursor" },
        category: "utilities",
      },
    ],
  ]);
  const errors = [];
  validateReadmeIndex(readme, entries, manifests, errors.push.bind(errors));
  assert.match(errors.join("\n"), /missing: bravo/);
  assert.match(errors.join("\n"), /alpha: description is out of sync/);
});

test("workflow validates pull requests and merged main reproducibly", () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const text = readFileSync(
    join(root, ".github/workflows/validate-plugins.yml"),
    "utf8"
  );
  assert.match(text, /on:\n  pull_request:\n  push:\n    branches: \[main\]/);
  assert.doesNotMatch(text, /\n\s+paths:/);
  assert.doesNotMatch(text, /npm install/);
  assert.match(text, /node --test scripts\/validate-plugins\.test\.mjs/);
});

test("plugin schema reuses the strict semantic-version definition", () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const schema = JSON.parse(
    readFileSync(join(root, "schemas/plugin.schema.json"), "utf8")
  );
  assert.equal(schema.properties.version.$ref, "#/$defs/semver");
  assert.deepEqual(
    validateAgainstSchema({ name: "example", version: "1.2.3" }, schema),
    []
  );
  assert.match(
    validateAgainstSchema({ name: "example", version: "latest" }, schema).join(
      "\n"
    ),
    /must match pattern/
  );
});
