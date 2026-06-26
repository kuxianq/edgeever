import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PLACEHOLDER_D1_ID = "00000000-0000-0000-0000-000000000000";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const wranglerArgs = process.argv.slice(2);
if (wranglerArgs.length === 0) {
  console.error("Usage: bun scripts/run-wrangler.mjs <wrangler args...>");
  process.exit(1);
}

const baseConfigPath = resolve(process.env.WRANGLER_CONFIG ?? "wrangler.toml");
const generatedConfigPath = resolve(".wrangler.generated.toml");
let config = readFileSync(baseConfigPath, "utf8");
let changed = false;

const replaceTomlValue = (source, key, value) => {
  if (!value) {
    return source;
  }

  const pattern = new RegExp(`(^${key}\\s*=\\s*")[^"]*(")`, "m");
  if (!pattern.test(source)) {
    throw new Error(`Cannot find ${key} in ${baseConfigPath}`);
  }

  changed = true;
  return source.replace(pattern, `$1${value}$2`);
};

const d1DatabaseId = process.env.EDGE_EVER_D1_DATABASE_ID?.trim();
if (d1DatabaseId) {
  if (!UUID_PATTERN.test(d1DatabaseId)) {
    throw new Error("EDGE_EVER_D1_DATABASE_ID must be a Cloudflare D1 UUID.");
  }

  config = replaceTomlValue(config, "database_id", d1DatabaseId);
}

config = replaceTomlValue(
  config,
  "database_name",
  process.env.EDGE_EVER_D1_DATABASE_NAME?.trim(),
);
config = replaceTomlValue(
  config,
  "bucket_name",
  process.env.EDGE_EVER_R2_BUCKET_NAME?.trim(),
);
config = replaceTomlValue(
  config,
  "preview_bucket_name",
  process.env.EDGE_EVER_R2_PREVIEW_BUCKET_NAME?.trim(),
);

const isRemoteCommand =
  wranglerArgs.includes("deploy") || wranglerArgs.includes("--remote");
if (isRemoteCommand && config.includes(`database_id = "${PLACEHOLDER_D1_ID}"`)) {
  console.error(
    [
      "Missing Cloudflare D1 database id.",
      "Set EDGE_EVER_D1_DATABASE_ID as a Cloudflare Build Variable,",
      "or replace the database_id placeholder in wrangler.toml / WRANGLER_CONFIG.",
    ].join(" "),
  );
  process.exit(1);
}

const configPath = changed ? generatedConfigPath : baseConfigPath;
if (changed) {
  writeFileSync(generatedConfigPath, config);
}

const executable = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
const result = spawnSync(executable, ["--config", configPath, ...wranglerArgs], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
