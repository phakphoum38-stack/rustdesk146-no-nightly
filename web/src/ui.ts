import type Connection from "./connection";

const REPOSITORY = "phakphoum38-stack/rustdesk146-no-nightly";
const RELEASE_TAG = "v1.4.9-custom";
const RELEASE_URL = `https://github.com/${REPOSITORY}/releases/tag/${RELEASE_TAG}`;
const ACTIONS_URL = `https://github.com/${REPOSITORY}/actions`;

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

type ReleaseResponse = {
  assets: ReleaseAsset[];
  html_url: string;
  name: string | null;
  tag_name: string;
};

declare global {
  interface Window {
    YUVCanvas?: {
      attach(canvas: HTMLCanvasElement): { drawFrame(frame: unknown): void };
    };
  }
}

let connection: Connection | null = null;
let frameSink: { drawFrame(frame: unknown): void } | null = null;
let runtimeApi: typeof import("./globals") | null = null;

export function mountPortal(root: HTMLDivElement | null) {
  if (!root) throw new Error("RustDesk web root was not found");

  root.innerHTML = `
    <header class="site-header">
      <a class="brand" href="#downloads" aria-label="RustDesk web home">
        <img src="./icon.png" alt="" />
        <span><strong>RustDesk</strong><small>1.4.9 web portal</small></span>
      </a>
      <nav class="nav-tabs" aria-label="Web portal sections">
        <button class="nav-tab is-active" data-view="downloads">Downloads</button>
        <button class="nav-tab" data-view="remote">Remote Lab <span>Experimental</span></button>
      </nav>
      <a class="github-link" href="${RELEASE_URL}" target="_blank" rel="noreferrer">GitHub release ↗</a>
    </header>

    <main>
      <section id="downloads-view" class="view is-active" aria-labelledby="downloads-heading">
        <div class="hero">
          <div class="hero-copy">
            <div class="eyebrow"><span class="pulse"></span> Multi-platform release ready</div>
            <h1 id="downloads-heading">Your desk.<br /><em>Anywhere.</em></h1>
            <p>One verified RustDesk 1.4.9 release for Windows, macOS, Linux, Android, and unsigned iOS builds.</p>
            <div class="hero-actions">
              <a id="recommended-download" class="button button-primary" href="${RELEASE_URL}" target="_blank" rel="noreferrer">
                View recommended download
              </a>
              <button class="button button-secondary" data-view="remote">Open Remote Lab</button>
            </div>
            <div class="release-proof">
              <span><strong>24</strong> successful build jobs</span>
              <span><strong>26</strong> native release assets</span>
              <span><strong>18</strong> workflow artifacts</span>
            </div>
          </div>
          <div class="hero-visual" aria-hidden="true">
            <div class="orbit orbit-one"></div>
            <div class="orbit orbit-two"></div>
            <div class="device device-main"><div class="device-screen"><span>RD</span></div></div>
            <div class="device device-phone"></div>
            <div class="status-chip">Encrypted connection</div>
          </div>
        </div>

        <section class="download-section" aria-labelledby="platform-heading">
          <div class="section-heading">
            <div><span class="kicker">All platforms</span><h2 id="platform-heading">Choose your build</h2></div>
            <span id="release-status" class="release-status">Discovering release assets…</span>
          </div>
          <div id="download-grid" class="download-grid" aria-live="polite">
            ${platformSkeletons()}
          </div>
        </section>

        <section class="trust-strip">
          <div><span>01</span><strong>Self-hostable</strong><small>Use RustDesk public infrastructure or your own server.</small></div>
          <div><span>02</span><strong>Cross-platform</strong><small>Desktop, mobile, and browser preview in one release flow.</small></div>
          <div><span>03</span><strong>Auditable</strong><small>Build results, artifacts, and source remain visible on GitHub.</small></div>
        </section>
      </section>

      <section id="remote-view" class="view" aria-labelledby="remote-heading">
        <div class="remote-header">
          <div>
            <div class="eyebrow experimental"><span></span> Browser protocol preview</div>
            <h1 id="remote-heading">Remote Lab</h1>
            <p>Connect through RustDesk WebSocket rendezvous and relay endpoints. Built for validation—not unattended production access.</p>
          </div>
          <button class="button button-secondary" data-view="downloads">← Back to downloads</button>
        </div>

        <div class="remote-layout">
          <aside class="connection-panel">
            <div class="panel-title"><span>Connection</span><span id="connection-dot" class="connection-dot"></span></div>
            <form id="connection-form">
              <label>RustDesk ID<input id="remote-id" inputmode="numeric" autocomplete="off" placeholder="123 456 789" required /></label>
              <label>Rendezvous server<input id="remote-server" autocomplete="url" placeholder="rs-sg.rustdesk.com or your server" required /></label>
              <div class="field-row">
                <label>WebSocket<select id="remote-scheme"><option value="auto">Auto</option><option value="wss">WSS</option><option value="ws">WS</option></select></label>
                <label>Server key<input id="remote-key" autocomplete="off" placeholder="Optional" /></label>
              </div>
              <button id="connect-button" class="button button-primary button-wide" type="submit">Connect securely</button>
            </form>

            <div id="password-panel" class="password-panel" hidden>
              <label>Remote password<input id="remote-password" type="password" autocomplete="current-password" /></label>
              <label class="check-label"><input id="remember-password" type="checkbox" /> Remember password hash in this browser</label>
              <div class="inline-actions">
                <button id="password-submit" class="button button-primary" type="button">Continue</button>
                <button id="password-cancel" class="button button-ghost" type="button">Cancel</button>
              </div>
            </div>

            <div class="security-note">
              <strong>Before connecting</strong>
              <p>HTTPS pages require a WSS-capable proxy. A normal <code>ws://</code> endpoint works only when this portal is served over HTTP or locally.</p>
            </div>
            <div id="connection-status" class="connection-status" role="status">Ready. Enter a server and RustDesk ID.</div>
          </aside>

          <section id="viewer-shell" class="viewer-shell">
            <div class="viewer-toolbar">
              <div><span class="viewer-label">Remote display</span><span id="viewer-meta">Not connected</span></div>
              <div class="viewer-actions">
                <button id="refresh-button" title="Refresh video" disabled>↻</button>
                <button id="cad-button" title="Send Ctrl+Alt+Delete" disabled>⌨</button>
                <button id="fullscreen-button" title="Full screen" disabled>⛶</button>
                <button id="disconnect-button" class="danger" title="Disconnect" disabled>Disconnect</button>
              </div>
            </div>
            <div class="viewer-stage">
              <canvas id="remote-canvas" tabindex="0" aria-label="Remote desktop display"></canvas>
              <div id="viewer-empty" class="viewer-empty">
                <div class="viewer-glyph"><span></span></div>
                <strong>No active session</strong>
                <p>Your remote screen will appear here after the encrypted handshake completes.</p>
              </div>
            </div>
            <div class="text-input-bar">
              <input id="remote-text" placeholder="Send text to the remote device" disabled />
              <button id="send-text-button" disabled>Send text</button>
            </div>
          </section>
        </div>

        <div class="lab-notes">
          <article><span>Supported</span><h3>Relay connection, password handshake, VP9 video, pointer, keyboard, clipboard, audio</h3></article>
          <article><span>Not yet native-equivalent</span><h3>Direct NAT traversal, file transfer, multi-window, hardware decoding, unattended browser hosting</h3></article>
        </div>
      </section>
    </main>

    <footer><span>RustDesk 1.4.9 custom build</span><span>Source and build history remain on GitHub.</span></footer>
  `;

  bindNavigation();
  bindRemoteLab();
  void loadReleaseAssets();
}

function platformSkeletons() {
  return ["Windows", "macOS", "Linux", "Android", "iOS"].map((name) => `
    <article class="download-card is-loading"><div class="platform-icon">${name.slice(0, 2)}</div><div><h3>${name}</h3><p>Loading builds…</p></div></article>
  `).join("");
}

function bindNavigation() {
  document.querySelectorAll<HTMLElement>("[data-view]").forEach((element) => {
    element.addEventListener("click", () => showView(element.dataset.view || "downloads"));
  });
}

function showView(view: string) {
  const target = view === "remote" ? "remote" : "downloads";
  document.querySelectorAll(".view").forEach((element) => element.classList.toggle("is-active", element.id === `${target}-view`));
  document.querySelectorAll<HTMLElement>(".nav-tab").forEach((element) => element.classList.toggle("is-active", element.dataset.view === target));
  history.replaceState(null, "", `#${target}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadReleaseAssets() {
  const grid = document.querySelector<HTMLDivElement>("#download-grid");
  const status = document.querySelector<HTMLSpanElement>("#release-status");
  if (!grid || !status) return;

  try {
    const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/releases/tags/${RELEASE_TAG}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const release = await response.json() as ReleaseResponse;
    renderDownloads(grid, release.assets);
    status.textContent = `${release.assets.length} verified assets · ${release.tag_name}`;
    updateRecommendedDownload(release.assets);
  } catch (error) {
    status.textContent = "Release discovery unavailable — open GitHub for all files";
    grid.innerHTML = fallbackCards();
    console.warn(error);
  }
}

function renderDownloads(grid: HTMLDivElement, assets: ReleaseAsset[]) {
  const groups = [
    { name: "Windows", icon: "Win", note: "EXE and MSI · x86, x64, ARM64", match: (a: ReleaseAsset) => /\.(exe|msi)$/i.test(a.name) },
    { name: "macOS", icon: "Mac", note: "DMG · Intel and Apple Silicon", match: (a: ReleaseAsset) => /\.dmg$/i.test(a.name) },
    { name: "Linux", icon: "Lin", note: "DEB, RPM, AppImage, Flatpak, Arch", match: (a: ReleaseAsset) => /\.(deb|rpm|appimage|flatpak|zst)$/i.test(a.name) },
    { name: "Android", icon: "And", note: "Universal and per-architecture APK", match: (a: ReleaseAsset) => /\.apk$/i.test(a.name) },
  ];

  grid.innerHTML = groups.map((group) => {
    const matches = assets.filter(group.match);
    const primary = choosePrimary(group.name, matches);
    return cardMarkup(group.name, group.icon, group.note, primary, matches.length);
  }).join("") + cardMarkup("iOS", "iOS", "Unsigned ARM64 archive · signing required", null, 1, ACTIONS_URL);
}

function cardMarkup(name: string, icon: string, note: string, primary: ReleaseAsset | null, count: number, fallback = RELEASE_URL) {
  const href = primary ? safeUrl(primary.browser_download_url) : fallback;
  const detail = primary ? `${formatBytes(primary.size)} · ${count} option${count === 1 ? "" : "s"}` : "Available in workflow artifacts";
  return `
    <article class="download-card">
      <div class="platform-icon">${escapeHtml(icon)}</div>
      <div class="card-copy"><h3>${escapeHtml(name)}</h3><p>${escapeHtml(note)}</p><small>${escapeHtml(detail)}</small></div>
      <a href="${href}" target="_blank" rel="noreferrer" aria-label="Download RustDesk for ${escapeHtml(name)}">↓</a>
    </article>
  `;
}

function fallbackCards() {
  return [
    ["Windows", "Win", "EXE and MSI · x86, x64, ARM64"],
    ["macOS", "Mac", "DMG · Intel and Apple Silicon"],
    ["Linux", "Lin", "DEB, RPM, AppImage, Flatpak, Arch"],
    ["Android", "And", "Universal and per-architecture APK"],
    ["iOS", "iOS", "Unsigned ARM64 archive · signing required"],
  ].map(([name, icon, note]) => cardMarkup(name, icon, note, null, 0)).join("");
}

function choosePrimary(platform: string, assets: ReleaseAsset[]) {
  const patterns: Record<string, RegExp[]> = {
    Windows: [/x86_64\.exe$/i, /aarch64\.exe$/i, /\.msi$/i],
    macOS: [/aarch64.*\.dmg$/i, /\.dmg$/i],
    Linux: [/x86_64\.AppImage$/i, /x86_64\.deb$/i, /\.flatpak$/i],
    Android: [/universal\.apk$/i, /aarch64\.apk$/i],
  };
  for (const pattern of patterns[platform] || []) {
    const match = assets.find((asset) => pattern.test(asset.name));
    if (match) return match;
  }
  return assets[0] || null;
}

function updateRecommendedDownload(assets: ReleaseAsset[]) {
  const link = document.querySelector<HTMLAnchorElement>("#recommended-download");
  if (!link) return;
  const agent = navigator.userAgent;
  const platform = /Android/i.test(agent) ? "Android" : /Mac/i.test(agent) ? "macOS" : /Linux/i.test(agent) ? "Linux" : "Windows";
  const candidates = assets.filter((asset) => ({
    Windows: /\.(exe|msi)$/i,
    macOS: /\.dmg$/i,
    Linux: /\.(AppImage|deb|flatpak)$/i,
    Android: /\.apk$/i,
  }[platform]?.test(asset.name)));
  const primary = choosePrimary(platform, candidates);
  if (primary) {
    link.href = safeUrl(primary.browser_download_url);
    link.textContent = `Download for ${platform} · ${formatBytes(primary.size)}`;
  }
}

function bindRemoteLab() {
  const form = document.querySelector<HTMLFormElement>("#connection-form");
  const canvas = document.querySelector<HTMLCanvasElement>("#remote-canvas");
  if (!form || !canvas) return;

  const id = document.querySelector<HTMLInputElement>("#remote-id")!;
  const server = document.querySelector<HTMLInputElement>("#remote-server")!;
  const key = document.querySelector<HTMLInputElement>("#remote-key")!;
  const scheme = document.querySelector<HTMLSelectElement>("#remote-scheme")!;
  id.value = localStorage.getItem("rustdesk-web-id") || "";
  server.value = localStorage.getItem("custom-rendezvous-server") || "rs-sg.rustdesk.com";
  key.value = localStorage.getItem("key") || "";
  scheme.value = localStorage.getItem("rustdesk-websocket-scheme") || "auto";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const remoteId = id.value.replace(/\s+/g, "");
    if (!remoteId || !server.value.trim()) return;
    if (location.protocol === "https:" && scheme.value === "ws") {
      setStatus("error", "Mixed content blocked: choose WSS or serve this portal locally over HTTP.");
      return;
    }

    localStorage.setItem("rustdesk-web-id", remoteId);
    localStorage.setItem("custom-rendezvous-server", server.value.trim());
    localStorage.setItem("key", key.value.trim());
    localStorage.setItem("rustdesk-websocket-scheme", scheme.value);
    setStatus("working", "Preparing encrypted browser runtime…");
    setConnected(false, true);

    try {
      const runtime = await ensureRemoteRuntime();
      await runtime.initializeCrypto();
      if (window.YUVCanvas && !frameSink) frameSink = window.YUVCanvas.attach(canvas);
      connection = runtime.newConn();
      connection.setMsgbox(handleMessage);
      connection.setDraw((frame: unknown) => {
        frameSink?.drawFrame(frame);
        document.querySelector("#viewer-empty")?.setAttribute("hidden", "");
        canvas.classList.add("is-live");
        setConnected(true);
      });
      await connection.start(remoteId);
    } catch (error) {
      setStatus("error", String(error));
      disconnect();
    }
  });

  document.querySelector("#password-submit")?.addEventListener("click", submitPassword);
  document.querySelector("#password-cancel")?.addEventListener("click", disconnect);
  document.querySelector("#disconnect-button")?.addEventListener("click", disconnect);
  document.querySelector("#refresh-button")?.addEventListener("click", () => connection?.refresh());
  document.querySelector("#cad-button")?.addEventListener("click", () => connection?.ctrlAltDel());
  document.querySelector("#fullscreen-button")?.addEventListener("click", () => document.querySelector("#viewer-shell")?.requestFullscreen());
  document.querySelector("#send-text-button")?.addEventListener("click", sendText);

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas.addEventListener("pointermove", (event) => sendPointer(event, 0));
  canvas.addEventListener("pointerdown", (event) => { canvas.focus(); sendPointer(event, 1); });
  canvas.addEventListener("pointerup", (event) => sendPointer(event, 2));
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    connection?.inputMouse(3, Math.round(event.deltaX), Math.round(event.deltaY), event.altKey, event.ctrlKey, event.shiftKey, event.metaKey);
  }, { passive: false });
  canvas.addEventListener("keydown", (event) => sendKey(event, true));
  canvas.addEventListener("keyup", (event) => sendKey(event, false));

  window.addEventListener("rustdesk:event", ((event: CustomEvent) => {
    const { name, payload } = event.detail || {};
    if (name === "peer_info") {
      const platform = payload?.platform || "remote device";
      document.querySelector("#viewer-meta")!.textContent = `Connected · ${platform}`;
      setStatus("success", `Connected to ${platform}. Waiting for video frames…`);
      setConnected(true);
    }
  }) as EventListener);
}

function handleMessage(type: string, title: string, text: string) {
  const passwordPanel = document.querySelector<HTMLElement>("#password-panel")!;
  if (type === "input-password" || type === "re-input-password") {
    passwordPanel.hidden = false;
    document.querySelector<HTMLInputElement>("#remote-password")?.focus();
    setStatus("working", "Remote password required.");
    return;
  }
  passwordPanel.hidden = true;
  if (!type) {
    setStatus("success", "Remote video stream is active.");
    return;
  }
  setStatus(type === "error" ? "error" : type === "success" ? "success" : "working", text || title);
}

function submitPassword() {
  const input = document.querySelector<HTMLInputElement>("#remote-password")!;
  const remember = document.querySelector<HTMLInputElement>("#remember-password")!;
  if (!connection || !input.value) return;
  connection.setRemember(remember.checked);
  connection.login(input.value);
  input.value = "";
  document.querySelector<HTMLElement>("#password-panel")!.hidden = true;
  setStatus("working", "Authenticating with the remote device…");
}

function disconnect() {
  runtimeApi?.close();
  connection = null;
  setConnected(false);
  setStatus("idle", "Disconnected. Enter a server and RustDesk ID to reconnect.");
  const canvas = document.querySelector<HTMLCanvasElement>("#remote-canvas");
  canvas?.classList.remove("is-live");
  document.querySelector("#viewer-empty")?.removeAttribute("hidden");
  document.querySelector<HTMLElement>("#password-panel")!.hidden = true;
  document.querySelector("#viewer-meta")!.textContent = "Not connected";
}

async function ensureRemoteRuntime() {
  if (runtimeApi) return runtimeApi;
  await loadClassicScript("./ogvjs-1.8.6/ogv.js");
  await loadClassicScript("./yuv-canvas-1.2.6.js");
  runtimeApi = await import("./globals");
  return runtimeApi;
}

function loadClassicScript(path: string) {
  const absolute = new URL(path, document.baseURI).href;
  const existing = Array.from(document.scripts).find((script) => script.src === absolute);
  if (existing) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = absolute;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load browser runtime: ${path}`));
    document.head.appendChild(script);
  });
}

function setConnected(connected: boolean, connecting = false) {
  const controls = ["#refresh-button", "#cad-button", "#fullscreen-button", "#disconnect-button", "#remote-text", "#send-text-button"];
  controls.forEach((selector) => {
    const element = document.querySelector<HTMLInputElement | HTMLButtonElement>(selector);
    if (element) element.disabled = !connected;
  });
  const button = document.querySelector<HTMLButtonElement>("#connect-button");
  if (button) {
    button.disabled = connecting || connected;
    button.textContent = connecting ? "Connecting…" : connected ? "Connected" : "Connect securely";
  }
  document.querySelector("#connection-dot")?.classList.toggle("is-live", connected);
}

function setStatus(type: string, text: string) {
  const element = document.querySelector<HTMLElement>("#connection-status");
  if (!element) return;
  element.className = `connection-status is-${type}`;
  element.textContent = text;
}

function sendPointer(event: PointerEvent, state: number) {
  if (!connection) return;
  const canvas = event.currentTarget as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((event.clientX - rect.left) * ((canvas.width || rect.width) / rect.width));
  const y = Math.round((event.clientY - rect.top) * ((canvas.height || rect.height) / rect.height));
  const button = event.button === 2 ? 2 : event.button === 1 ? 4 : 1;
  const mask = state ? state | (button << 3) : 0;
  connection.inputMouse(mask, x, y, event.altKey, event.ctrlKey, event.shiftKey, event.metaKey);
}

function sendKey(event: KeyboardEvent, down: boolean) {
  if (!connection) return;
  event.preventDefault();
  connection.inputKey(event.key, down, false, event.altKey, event.ctrlKey, event.shiftKey, event.metaKey);
}

function sendText() {
  const input = document.querySelector<HTMLInputElement>("#remote-text");
  if (!connection || !input?.value) return;
  connection.inputString(input.value);
  input.value = "";
}

function formatBytes(bytes: number) {
  if (!bytes) return "Unknown size";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com" ? url.href : RELEASE_URL;
  } catch {
    return RELEASE_URL;
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}
