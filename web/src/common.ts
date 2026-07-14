import * as zstd from "zstddec";
import { KeyEvent, controlKeyFromJSON, ControlKey } from "./message";
import { KEY_MAP } from "./gen_js_from_hbb";

let decompressor: zstd.ZSTDDecoder;

export async function initZstd() {
  const instance = new zstd.ZSTDDecoder();
  await instance.init();
  decompressor = instance;
}

export async function decompress(compressedArray: Uint8Array) {
  const maximum = 64 * 1024 * 1024;
  const minimum = 1024 * 1024;
  const outputSize = Math.min(maximum, Math.max(minimum, 30 * compressedArray.length));
  try {
    if (!decompressor) await initZstd();
    return decompressor.decode(compressedArray, outputSize);
  } catch (error) {
    console.error("Unable to decompress RustDesk payload", error);
    return undefined;
  }
}

export function translate(_locale: string, text: string): string {
  return text;
}

export function mapKey(name: string, isDesktop: Boolean) {
  const mapped = KEY_MAP[name] || name;
  if (mapped.length === 1) {
    const code = mapped.charCodeAt(0);
    return !isDesktop ? KeyEvent.fromPartial({ unicode: code }) : KeyEvent.fromPartial({ chr: code });
  }
  const controlKey = controlKeyFromJSON(mapped);
  if (controlKey === ControlKey.UNRECOGNIZED) {
    console.warn(`Unsupported browser key: ${name}`);
    return undefined;
  }
  return KeyEvent.fromPartial({ control_key: controlKey });
}

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
