import Connection from "./connection";
import sodiumModule from "libsodium-wrappers";
import PCMPlayer from "pcm-player";

let currentConnection;
let sodium;
let pcmPlayer;
let opusWorker;

function emit(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function isDesktop() {
  return !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function msgbox(type, title, text) {
  emit("rustdesk:status", { type, title, text });
}

export function pushEvent(name, payload) {
  emit("rustdesk:event", { name, payload });
}

export function draw(frame) {
  emit("rustdesk:frame", frame);
}

export function setConn(connection) {
  currentConnection = connection;
}

export function getConn() {
  return currentConnection;
}

export async function startConn(id) {
  if (!currentConnection) newConn();
  await currentConnection.start(id);
}

export function close() {
  currentConnection?.close();
  currentConnection = undefined;
}

export function newConn() {
  close();
  const connection = new Connection();
  setConn(connection);
  return connection;
}

async function readySodium() {
  if (!sodium) {
    await sodiumModule.ready;
    sodium = sodiumModule;
  }
  return sodium;
}

export async function verify(signed, publicKey) {
  const api = await readySodium();
  const key = typeof publicKey === "string"
    ? api.from_base64(publicKey, api.base64_variants.ORIGINAL)
    : publicKey;
  return api.crypto_sign_open(signed, key);
}

export function decodeBase64(value) {
  if (!sodium) throw new Error("Encryption runtime is not ready");
  return sodium.from_base64(value, sodium.base64_variants.ORIGINAL);
}

export function genBoxKeyPair() {
  if (!sodium) throw new Error("Encryption runtime is not ready");
  const pair = sodium.crypto_box_keypair();
  return [pair.privateKey, pair.publicKey];
}

export function genSecretKey() {
  if (!sodium) throw new Error("Encryption runtime is not ready");
  return sodium.crypto_secretbox_keygen();
}

export function seal(unsigned, theirPublicKey, ourSecretKey) {
  if (!sodium) throw new Error("Encryption runtime is not ready");
  const nonce = Uint8Array.from(Array(24).fill(0));
  return sodium.crypto_box_easy(unsigned, nonce, theirPublicKey, ourSecretKey);
}

function makeNonce(value) {
  const bytes = Array(24).fill(0);
  for (let index = 0; index < bytes.length && value > 0; index += 1) {
    const byte = value & 0xff;
    bytes[index] = byte;
    value = (value - byte) / 256;
  }
  return Uint8Array.from(bytes);
}

export function encrypt(unsigned, nonce, key) {
  if (!sodium) throw new Error("Encryption runtime is not ready");
  return sodium.crypto_secretbox_easy(unsigned, makeNonce(nonce), key);
}

export function decrypt(signed, nonce, key) {
  if (!sodium) throw new Error("Encryption runtime is not ready");
  return sodium.crypto_secretbox_open_easy(signed, makeNonce(nonce), key);
}

export async function initializeCrypto() {
  await readySodium();
}

export function initAudio(channels, sampleRate) {
  try {
    pcmPlayer?.destroy?.();
    pcmPlayer = new PCMPlayer({ channels, sampleRate, flushingTime: 1000 });
    if (!opusWorker) {
      opusWorker = new Worker(new URL("./libopus.js", document.baseURI));
      opusWorker.onmessage = (event) => pcmPlayer?.feed(event.data);
    }
    opusWorker.postMessage({ channels, sampleRate });
  } catch (error) {
    emit("rustdesk:status", {
      type: "warning",
      title: "Audio unavailable",
      text: String(error),
    });
  }
}

export function playAudio(packet) {
  if (opusWorker) {
    opusWorker.postMessage(packet, [packet.buffer]);
  }
}

export function getPeers() {
  try {
    return JSON.parse(localStorage.getItem("rustdesk-web-peers") || "{}");
  } catch {
    return {};
  }
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}
