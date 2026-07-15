import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "..");
const protoRoot = join(repoRoot, "libs", "hbb_common", "protos");
const output = join(webRoot, "src");
const binDir = join(webRoot, "node_modules", ".bin");
const windows = process.platform === "win32";
const plugin = join(binDir, windows ? "protoc-gen-ts_proto.cmd" : "protoc-gen-ts_proto");
const protocScript = join(webRoot, "node_modules", "protoc", "protoc.cjs");

if (!existsSync(protocScript) || !existsSync(plugin)) {
  throw new Error("Web build tools are missing. Run npm install in web/ first.");
}

mkdirSync(output, { recursive: true });
const args = [
  `--plugin=protoc-gen-ts_proto=${plugin}`,
  `-I${protoRoot}`,
  `--ts_proto_out=${output}`,
  "--ts_proto_opt=esModuleInterop=true,snakeToCamel=false,useOptionals=none,outputServices=none,env=browser",
  "rendezvous.proto",
  "message.proto",
];

const result = spawnSync(process.execPath, [protocScript, ...args], {
  cwd: protoRoot,
  stdio: "inherit",
});

if (result.status !== 0) {
  throw new Error(`Protocol generation failed with exit code ${result.status ?? "unknown"}.`);
}
