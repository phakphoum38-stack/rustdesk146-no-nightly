import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const URL = "https://github.com/rustdesk/doc.rustdesk.com/releases/download/console/web_deps.tar.gz";
const SHA256 = "b66011c4fc066b90c46ba0c78884fe5d1a7e5a7fad3dce401300ad893de63818";
const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const publicDir = join(webRoot, "public");
const cacheDir = join(webRoot, ".cache");
const archive = join(cacheDir, "web_deps.tar.gz");
const marker = join(publicDir, "ogvjs-1.8.6", "ogv.js");

if (existsSync(marker) && existsSync(join(publicDir, "libopus.wasm"))) {
  process.exit(0);
}

mkdirSync(cacheDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

if (!existsSync(archive)) {
  const response = await fetch(URL);
  if (!response.ok) {
    throw new Error(`Unable to download official RustDesk web runtime: HTTP ${response.status}`);
  }
  writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
}

const digest = createHash("sha256").update(readFileSync(archive)).digest("hex");
if (digest !== SHA256) {
  rmSync(archive, { force: true });
  throw new Error(`RustDesk web runtime checksum mismatch: ${digest}`);
}

const result = spawnSync("tar", ["-xzf", archive, "-C", publicDir], { stdio: "inherit" });
if (result.status !== 0) {
  throw new Error(`Unable to extract RustDesk web runtime (exit ${result.status ?? "unknown"}).`);
}
