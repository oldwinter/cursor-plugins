#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, "..");
let errors = 0;

function fail(message) {
  console.error("ERROR: " + message);
  errors += 1;
}

function reportSchemaErrors(prefix, schemaErrors) {
  fail(prefix);
  for (const error of schemaErrors) {
    console.error("  " + error);
  }
}

const marketplaceSchema = loadJson(
  resolve(root, "schemas/marketplace.schema.json"),
  "schemas/marketplace.schema.json",
  fail
);
const pluginSchema = loadJson(
  resolve(root, "schemas/plugin.schema.json"),
  "schemas/plugin.schema.json",
  fail
);

const marketplacePath = resolve(root, ".cursor-plugin/marketplace.json");
if (!existsSync(marketplacePath)) {
  fail(".cursor-plugin/marketplace.json not found");
}
const marketplace = existsSync(marketplacePath)
  ? loadJson(marketplacePath, ".cursor-plugin/marketplace.json", fail)
  : null;

const marketplaceSchemaErrors =
  marketplace && marketplaceSchema
    ? validateAgainstSchema(marketplace, marketplaceSchema)
    : [];
if (marketplaceSchemaErrors.length > 0) {
  reportSchemaErrors(
    "marketplace.json schema validation failed:",
    marketplaceSchemaErrors
  );
}

const entries = Array.isArray(marketplace?.plugins) ? marketplace.plugins : [];
validateEntryUniqueness(entries, fail);
const registeredManifests = new Set();
const manifestsByName = new Map();

for (const entry of entries) {
  const source = analyzeSource(root, entry.source);
  if (source.error) {
    fail('Plugin "' + entry.name + '": ' + source.error);
    continue;
  }
  if (source.kind === "remote") continue;

  const pluginDirectory = source.directory;
  const pluginJsonPath = resolve(
    pluginDirectory,
    ".cursor-plugin/plugin.json"
  );
  if (!existsSync(pluginDirectory)) {
    fail(
      'Plugin "' +
        entry.name +
        '": source directory "' +
        entry.source +
        '" does not exist'
    );
    continue;
  }
  if (!existsSync(pluginJsonPath)) {
    fail(
      'Plugin "' +
        entry.name +
        '": missing .cursor-plugin/plugin.json in "' +
        entry.source +
        '"'
    );
    continue;
  }

  registeredManifests.add(pluginJsonPath);
  const pluginLabel = entry.source + "/.cursor-plugin/plugin.json";
  const pluginJson = loadJson(pluginJsonPath, pluginLabel, fail);
  if (!pluginJson) continue;
  manifestsByName.set(entry.name, pluginJson);

  const pluginSchemaErrors = pluginSchema
    ? validateAgainstSchema(pluginJson, pluginSchema)
    : [];
  if (pluginSchemaErrors.length > 0) {
    reportSchemaErrors(
      'Plugin "' + entry.name + '": plugin.json schema validation failed:',
      pluginSchemaErrors
    );
  }
  if (pluginJson.name && pluginJson.name !== entry.name) {
    fail(
      'Plugin "' +
        entry.name +
        '": marketplace name does not match plugin.json name "' +
        pluginJson.name +
        '"'
    );
  }
  validateVersion(pluginJson, pluginLabel, fail);
  validateComponentIntegrity(
    pluginDirectory,
    pluginJson,
    pluginLabel,
    fail
  );
}

validateOrphanManifests(root, registeredManifests, fail);

try {
  const readme = readFileSync(resolve(root, "README.md"), "utf8");
  validateReadmeIndex(readme, entries, manifestsByName, fail);
} catch (error) {
  fail("README.md: cannot read plugin index: " + error.message);
}

if (errors > 0) {
  console.error("\nValidation failed with " + errors + " error(s).");
  process.exit(1);
}

console.log("All plugins validated successfully.");
