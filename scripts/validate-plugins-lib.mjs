import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import {
  basename,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

export const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?$/;

function schemaTypeMatches(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "object") {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  if (type === "null") return value === null;
  return typeof value === type;
}

function resolveSchemaReference(rootSchema, reference) {
  if (!reference.startsWith("#/")) {
    throw new Error("only local schema references are supported: " + reference);
  }
  return reference
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, part) => value?.[part], rootSchema);
}

function validateSchemaNode(value, schema, rootSchema, path, errors) {
  if (schema.$ref) {
    const referenced = resolveSchemaReference(rootSchema, schema.$ref);
    if (!referenced) {
      errors.push(path + ": unresolved schema reference " + schema.$ref);
      return;
    }
    validateSchemaNode(value, referenced, rootSchema, path, errors);
    return;
  }

  if (schema.oneOf) {
    const matches = schema.oneOf.filter((candidate) => {
      const candidateErrors = [];
      validateSchemaNode(value, candidate, rootSchema, path, candidateErrors);
      return candidateErrors.length === 0;
    });
    if (matches.length !== 1) {
      errors.push(path + ": must match exactly one allowed schema");
    }
    return;
  }

  if (Object.hasOwn(schema, "const") && value !== schema.const) {
    errors.push(path + ": must equal " + JSON.stringify(schema.const));
  }
  if (schema.type && !schemaTypeMatches(value, schema.type)) {
    errors.push(path + ": must be " + schema.type);
    return;
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(path + ": must have at least " + schema.minLength + " character(s)");
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(path + ": must match pattern " + schema.pattern);
    }
    if (schema.format === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(path + ": must be a valid email address");
    }
    if (schema.format === "uri") {
      try {
        new URL(value);
      } catch {
        errors.push(path + ": must be a valid URI");
      }
    }
  }

  if (Array.isArray(value)) {
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) {
        errors.push(path + ": array items must be unique");
      }
    }
    if (schema.items) {
      value.forEach((item, index) =>
        validateSchemaNode(
          item,
          schema.items,
          rootSchema,
          path + "/" + index,
          errors
        )
      );
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (schema.minProperties !== undefined && keys.length < schema.minProperties) {
      errors.push(
        path + ": must have at least " + schema.minProperties + " property/properties"
      );
    }
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(value, required)) {
        errors.push(path + ": missing required property " + required);
      }
    }
    for (const [key, propertyValue] of Object.entries(value)) {
      const propertySchema = schema.properties?.[key];
      if (propertySchema) {
        validateSchemaNode(
          propertyValue,
          propertySchema,
          rootSchema,
          path + "/" + key,
          errors
        );
      } else if (schema.additionalProperties === false) {
        errors.push(path + ": unsupported property " + key);
      } else if (
        schema.additionalProperties &&
        typeof schema.additionalProperties === "object"
      ) {
        validateSchemaNode(
          propertyValue,
          schema.additionalProperties,
          rootSchema,
          path + "/" + key,
          errors
        );
      }
    }
  }
}

export function validateAgainstSchema(value, schema) {
  const errors = [];
  validateSchemaNode(value, schema, schema, "", errors);
  return errors.map((error) => error.replace(/^:/, "/:"));
}

function normalizeRelative(path) {
  return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

function isAbsoluteLike(path) {
  return (
    isAbsolute(path) ||
    /^[A-Za-z]:[\\/]/.test(path) ||
    path.startsWith("\\\\")
  );
}

function isWithin(base, candidate) {
  const pathFromBase = relative(resolve(base), resolve(candidate));
  return (
    pathFromBase === "" ||
    (!pathFromBase.startsWith(".." + sep) &&
      pathFromBase !== ".." &&
      !isAbsolute(pathFromBase))
  );
}

export function loadJson(path, label, fail) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    fail(label + ": cannot read JSON: " + error.message);
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    fail(label + ": invalid JSON: " + error.message);
    return null;
  }
}

export function isRemoteSource(source) {
  if (typeof source !== "string") return false;
  try {
    const url = new URL(source);
    return url.protocol !== "file:" && Boolean(url.protocol);
  } catch {
    return false;
  }
}

export function analyzeSource(root, source) {
  if (typeof source !== "string" || source.length === 0) {
    return { error: "source must be a non-empty string" };
  }
  const normalized = normalizeRelative(source);
  if (isAbsoluteLike(source) || normalized.split("/").includes("..")) {
    return { error: "local source escapes the repository root: " + source };
  }
  if (isRemoteSource(source)) return { kind: "remote", source };

  const directory = resolve(root, normalized);
  if (!isWithin(root, directory)) {
    return { error: "local source escapes the repository root: " + source };
  }
  if (existsSync(directory)) {
    const realDirectory = realpathSync(directory);
    if (!isWithin(realpathSync(root), realDirectory)) {
      return {
        error: "local source resolves outside the repository root: " + source,
      };
    }
  }
  return { kind: "local", source, directory };
}

export function validateEntryUniqueness(entries, fail) {
  for (const field of ["name", "source"]) {
    const seen = new Map();
    entries.forEach((entry, index) => {
      const value = entry?.[field];
      if (typeof value !== "string") return;
      const first = seen.get(value);
      if (first !== undefined) {
        fail(
          "marketplace.plugins[" +
            index +
            "]." +
            field +
            ": duplicate " +
            field +
            " " +
            JSON.stringify(value) +
            " (first at index " +
            first +
            ")"
        );
      } else {
        seen.set(value, index);
      }
    });
  }
}

function walk(root, options = {}) {
  if (!existsSync(root)) return [];
  const skip = new Set(options.skip ?? [".git", "node_modules"]);
  const results = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const path = resolve(directory, entry.name);
      results.push(path);
      if (entry.isDirectory()) visit(path);
    }
  };
  visit(root);
  return results;
}

export function findPluginManifests(root) {
  return walk(root).filter(
    (path) =>
      basename(path) === "plugin.json" &&
      basename(resolve(path, "..")) === ".cursor-plugin"
  );
}

export function validateOrphanManifests(root, registeredManifests, fail) {
  const registered = new Set(
    [...registeredManifests].map((path) => resolve(path))
  );
  for (const manifest of findPluginManifests(root)) {
    if (!registered.has(resolve(manifest))) {
      fail(
        normalizeRelative(relative(root, manifest)) +
          ": plugin manifest is not registered in marketplace.json"
      );
    }
  }
}

function globToRegExp(pattern) {
  let output = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === "*") {
      if (pattern[index + 1] === "*") {
        if (pattern[index + 2] === "/") {
          output += "(?:.*/)?";
          index += 2;
        } else {
          output += ".*";
          index += 1;
        }
      } else {
        output += "[^/]*";
      }
    } else if (char === "?") {
      output += "[^/]";
    } else {
      output += char.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
    }
  }
  return new RegExp(output + "/?$");
}

function resolveDeclaredPath(pluginRoot, declared, label, fail, allowUrl = false) {
  if (typeof declared !== "string" || declared.length === 0) {
    fail(label + ": path must be a non-empty string");
    return [];
  }
  const normalized = normalizeRelative(declared).replace(/\/$/, "");
  if (isAbsoluteLike(declared) || normalized.split("/").includes("..")) {
    fail(label + ": path escapes the plugin root: " + declared);
    return [];
  }
  if (allowUrl && isRemoteSource(declared)) return [];

  const hasGlob = /[*?]/.test(normalized);
  const candidates = hasGlob
    ? walk(pluginRoot).filter((path) =>
        globToRegExp(normalized).test(
          normalizeRelative(relative(pluginRoot, path))
        )
      )
    : [resolve(pluginRoot, normalized)];
  const existing = candidates.filter((path) => existsSync(path));
  if (existing.length === 0) {
    fail(label + ": path does not match an existing file or directory: " + declared);
    return [];
  }

  for (const candidate of existing) {
    if (!isWithin(pluginRoot, candidate)) {
      fail(label + ": path escapes the plugin root: " + declared);
      continue;
    }
    const realCandidate = realpathSync(candidate);
    if (!isWithin(realpathSync(pluginRoot), realCandidate)) {
      fail(label + ": path resolves outside the plugin root: " + declared);
    }
  }
  return existing;
}

function readFrontmatter(path, label, required, fail) {
  const text = readFileSync(path, "utf8").replace(/\r\n?/g, "\n");
  if (!text.startsWith("---\n")) {
    fail(label + ": missing YAML frontmatter");
    return;
  }
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    fail(label + ": unclosed YAML frontmatter");
    return;
  }
  const values = new Map();
  for (const line of text.slice(4, end).split("\n")) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (match) values.set(match[1], match[2]);
  }
  for (const key of required) {
    if (!values.has(key) || values.get(key).trim() === "") {
      fail(label + ": frontmatter requires non-empty " + key);
    }
  }
}

export function validateComponentIntegrity(pluginRoot, manifest, label, fail) {
  for (const field of ["commands", "agents", "skills", "rules"]) {
    const raw = manifest[field];
    if (raw === undefined) continue;
    const values = Array.isArray(raw) ? raw : [raw];
    values.forEach((value, index) =>
      resolveDeclaredPath(
        pluginRoot,
        value,
        label + "." + field + (values.length > 1 ? "[" + index + "]" : ""),
        fail
      )
    );
  }

  if (typeof manifest.hooks === "string") {
    resolveDeclaredPath(pluginRoot, manifest.hooks, label + ".hooks", fail);
  }
  if (typeof manifest.logo === "string") {
    resolveDeclaredPath(pluginRoot, manifest.logo, label + ".logo", fail, true);
  }
  const mcpValues = Array.isArray(manifest.mcpServers)
    ? manifest.mcpServers
    : [manifest.mcpServers];
  mcpValues.forEach((value, index) => {
    if (typeof value === "string") {
      resolveDeclaredPath(
        pluginRoot,
        value,
        label +
          ".mcpServers" +
          (mcpValues.length > 1 ? "[" + index + "]" : ""),
        fail
      );
    }
  });

  const files = walk(pluginRoot);
  const checks = [
    {
      matches: (path) =>
        basename(path) === "SKILL.md" &&
        normalizeRelative(relative(pluginRoot, path)).startsWith("skills/"),
      required: ["name", "description"],
    },
    {
      matches: (path) =>
        path.endsWith(".md") &&
        normalizeRelative(relative(pluginRoot, path)).startsWith("agents/"),
      required: ["name", "description"],
    },
    {
      matches: (path) =>
        /\.(md|txt)$/.test(path) &&
        normalizeRelative(relative(pluginRoot, path)).startsWith("commands/"),
      required: ["name", "description"],
    },
    {
      matches: (path) =>
        /\.(md|mdc)$/.test(path) &&
        normalizeRelative(relative(pluginRoot, path)).startsWith("rules/"),
      required: ["description"],
    },
  ];
  for (const check of checks) {
    for (const path of files.filter(check.matches)) {
      readFrontmatter(
        path,
        label + ":" + normalizeRelative(relative(pluginRoot, path)),
        check.required,
        fail
      );
    }
  }
}

export function validateVersion(manifest, label, fail) {
  if (
    manifest.version !== undefined &&
    (typeof manifest.version !== "string" ||
      !SEMVER_PATTERN.test(manifest.version))
  ) {
    fail(label + ".version: must be a strict semantic version");
  }
}

function titleCaseCategory(value) {
  return String(value ?? "")
    .split(/[- ]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function parseReadmeRows(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(
      /^\| \x60([^\x60]+)\x60 \| \[([^\]]+)\]\(([^)]+)\) \| ([^|]*) \| ([^|]*) \| (.*) \|$/
    );
    if (!match || match[1] === "name") continue;
    rows.push({
      name: match[1],
      displayName: match[2],
      source: match[3],
      author: match[4].trim(),
      category: match[5].trim(),
      description: match[6],
    });
  }
  return rows;
}

export function validateReadmeIndex(readmeText, entries, manifestsByName, fail) {
  const rows = parseReadmeRows(readmeText);
  const rowNames = rows.map((row) => row.name);
  const entryNames = entries.map((entry) => entry.name);
  if (JSON.stringify(rowNames) !== JSON.stringify(entryNames)) {
    const missing = entryNames.filter((name) => !rowNames.includes(name));
    const extra = rowNames.filter((name) => !entryNames.includes(name));
    fail(
      "README plugin table order/set differs from marketplace; missing: " +
        (missing.join(", ") || "none") +
        "; extra: " +
        (extra.join(", ") || "none")
    );
  }

  const rowsByName = new Map(rows.map((row) => [row.name, row]));
  for (const entry of entries) {
    const row = rowsByName.get(entry.name);
    if (!row) continue;
    const remote = isRemoteSource(entry.source);
    const expectedSource = remote
      ? entry.source
      : entry.source.replace(/\/$/, "") + "/";
    if (row.source !== expectedSource) {
      fail(
        "README row " +
          entry.name +
          ": source " +
          JSON.stringify(row.source) +
          " does not match " +
          JSON.stringify(expectedSource)
      );
    }
    if (row.description !== (entry.description ?? "")) {
      fail("README row " + entry.name + ": description is out of sync");
    }

    const manifest = manifestsByName.get(entry.name);
    if (!manifest) continue;
    const expected = {
      displayName: manifest.displayName ?? entry.name,
      author: manifest.author?.name ?? manifest.publisher ?? "",
      category: titleCaseCategory(manifest.category),
    };
    for (const field of ["displayName", "author", "category"]) {
      if (row[field] !== expected[field]) {
        fail("README row " + entry.name + ": " + field + " is out of sync");
      }
    }
  }
}
