(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function o(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(r){if(r.ep)return;r.ep=!0;const a=o(r);fetch(r.href,a)}})();const O="modulepreload",I=function(e,t){return new URL(e,t).href},$={},_=function(t,o,n){let r=Promise.resolve();if(o&&o.length>0){let s=function(l){return Promise.all(l.map(v=>Promise.resolve(v).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};const i=document.getElementsByTagName("link"),d=document.querySelector("meta[property=csp-nonce]"),p=d?.nonce||d?.getAttribute("nonce");r=s(o.map(l=>{if(l=I(l,n),l in $)return;$[l]=!0;const v=l.endsWith(".css"),f=v?'[rel="stylesheet"]':"";if(!!n)for(let b=i.length-1;b>=0;b--){const y=i[b];if(y.href===l&&(!v||y.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${l}"]${f}`))return;const m=document.createElement("link");if(m.rel=v?"stylesheet":O,v||(m.as="script"),m.crossOrigin="",m.href=l,p&&m.setAttribute("nonce",p),document.head.appendChild(m),v)return new Promise((b,y)=>{m.addEventListener("load",b),m.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(s){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=s,window.dispatchEvent(i),!i.defaultPrevented)throw s}return r.then(s=>{for(const i of s||[])i.status==="rejected"&&a(i.reason);return t().catch(a)})},A="phakphoum38-stack/rustdesk146-no-nightly",D="v1.4.9-custom",g=`https://github.com/${A}/releases/tag/${D}`,T=`https://github.com/${A}/actions`;let c=null,k=null,w=null;function W(e){if(!e)throw new Error("RustDesk web root was not found");e.innerHTML=`
    <header class="site-header">
      <a class="brand" href="#downloads" aria-label="RustDesk web home">
        <img src="./icon.png" alt="" />
        <span><strong>RustDesk</strong><small>1.4.9 web portal</small></span>
      </a>
      <nav class="nav-tabs" aria-label="Web portal sections">
        <button class="nav-tab is-active" data-view="downloads">Downloads</button>
        <button class="nav-tab" data-view="remote">Remote Lab <span>Experimental</span></button>
      </nav>
      <a class="github-link" href="${g}" target="_blank" rel="noreferrer">GitHub release ↗</a>
    </header>

    <main>
      <section id="downloads-view" class="view is-active" aria-labelledby="downloads-heading">
        <div class="hero">
          <div class="hero-copy">
            <div class="eyebrow"><span class="pulse"></span> Multi-platform release ready</div>
            <h1 id="downloads-heading">Your desk.<br /><em>Anywhere.</em></h1>
            <p>One verified RustDesk 1.4.9 release for Windows, macOS, Linux, Android, and unsigned iOS builds.</p>
            <div class="hero-actions">
              <a id="recommended-download" class="button button-primary" href="${g}" target="_blank" rel="noreferrer">
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
            ${K()}
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
  `,U(),G(),B()}function K(){return["Windows","macOS","Linux","Android","iOS"].map(e=>`
    <article class="download-card is-loading"><div class="platform-icon">${e.slice(0,2)}</div><div><h3>${e}</h3><p>Loading builds…</p></div></article>
  `).join("")}function U(){document.querySelectorAll("[data-view]").forEach(e=>{e.addEventListener("click",()=>N(e.dataset.view||"downloads"))})}function N(e){const t=e==="remote"?"remote":"downloads";document.querySelectorAll(".view").forEach(o=>o.classList.toggle("is-active",o.id===`${t}-view`)),document.querySelectorAll(".nav-tab").forEach(o=>o.classList.toggle("is-active",o.dataset.view===t)),history.replaceState(null,"",`#${t}`),window.scrollTo({top:0,behavior:"smooth"})}async function B(){const e=document.querySelector("#download-grid"),t=document.querySelector("#release-status");if(!(!e||!t))try{const o=await fetch(`https://api.github.com/repos/${A}/releases/tags/${D}`,{headers:{Accept:"application/vnd.github+json"}});if(!o.ok)throw new Error(`GitHub API returned ${o.status}`);const n=await o.json();H(e,n.assets),t.textContent=`${n.assets.length} verified assets · ${n.tag_name}`,z(n.assets)}catch(o){t.textContent="Release discovery unavailable — open GitHub for all files",e.innerHTML=j(),console.warn(o)}}function H(e,t){const o=[{name:"Windows",icon:"Win",note:"EXE and MSI · x86, x64, ARM64",match:n=>/\.(exe|msi)$/i.test(n.name)},{name:"macOS",icon:"Mac",note:"DMG · Intel and Apple Silicon",match:n=>/\.dmg$/i.test(n.name)},{name:"Linux",icon:"Lin",note:"DEB, RPM, AppImage, Flatpak, Arch",match:n=>/\.(deb|rpm|appimage|flatpak|zst)$/i.test(n.name)},{name:"Android",icon:"And",note:"Universal and per-architecture APK",match:n=>/\.apk$/i.test(n.name)}];e.innerHTML=o.map(n=>{const r=t.filter(n.match),a=C(n.name,r);return R(n.name,n.icon,n.note,a,r.length)}).join("")+R("iOS","iOS","Unsigned ARM64 archive · signing required",null,1,T)}function R(e,t,o,n,r,a=g){const s=n?P(n.browser_download_url):a,i=n?`${M(n.size)} · ${r} option${r===1?"":"s"}`:"Available in workflow artifacts";return`
    <article class="download-card">
      <div class="platform-icon">${h(t)}</div>
      <div class="card-copy"><h3>${h(e)}</h3><p>${h(o)}</p><small>${h(i)}</small></div>
      <a href="${s}" target="_blank" rel="noreferrer" aria-label="Download RustDesk for ${h(e)}">↓</a>
    </article>
  `}function j(){return[["Windows","Win","EXE and MSI · x86, x64, ARM64"],["macOS","Mac","DMG · Intel and Apple Silicon"],["Linux","Lin","DEB, RPM, AppImage, Flatpak, Arch"],["Android","And","Universal and per-architecture APK"],["iOS","iOS","Unsigned ARM64 archive · signing required"]].map(([e,t,o])=>R(e,t,o,null,0)).join("")}function C(e,t){const o={Windows:[/x86_64\.exe$/i,/aarch64\.exe$/i,/\.msi$/i],macOS:[/aarch64.*\.dmg$/i,/\.dmg$/i],Linux:[/x86_64\.AppImage$/i,/x86_64\.deb$/i,/\.flatpak$/i],Android:[/universal\.apk$/i,/aarch64\.apk$/i]};for(const n of o[e]||[]){const r=t.find(a=>n.test(a.name));if(r)return r}return t[0]||null}function z(e){const t=document.querySelector("#recommended-download");if(!t)return;const o=navigator.userAgent,n=/Android/i.test(o)?"Android":/Mac/i.test(o)?"macOS":/Linux/i.test(o)?"Linux":"Windows",r=e.filter(s=>({Windows:/\.(exe|msi)$/i,macOS:/\.dmg$/i,Linux:/\.(AppImage|deb|flatpak)$/i,Android:/\.apk$/i})[n]?.test(s.name)),a=C(n,r);a&&(t.href=P(a.browser_download_url),t.textContent=`Download for ${n} · ${M(a.size)}`)}function G(){const e=document.querySelector("#connection-form"),t=document.querySelector("#remote-canvas");if(!e||!t)return;const o=document.querySelector("#remote-id"),n=document.querySelector("#remote-server"),r=document.querySelector("#remote-key"),a=document.querySelector("#remote-scheme");o.value=localStorage.getItem("rustdesk-web-id")||"",n.value=localStorage.getItem("custom-rendezvous-server")||"rs-sg.rustdesk.com",r.value=localStorage.getItem("key")||"",a.value=localStorage.getItem("rustdesk-websocket-scheme")||"auto",e.addEventListener("submit",async s=>{s.preventDefault();const i=o.value.replace(/\s+/g,"");if(!(!i||!n.value.trim())){if(location.protocol==="https:"&&a.value==="ws"){u("error","Mixed content blocked: choose WSS or serve this portal locally over HTTP.");return}localStorage.setItem("rustdesk-web-id",i),localStorage.setItem("custom-rendezvous-server",n.value.trim()),localStorage.setItem("key",r.value.trim()),localStorage.setItem("rustdesk-websocket-scheme",a.value),u("working","Preparing encrypted browser runtime…"),S(!1,!0);try{const d=await V();await d.initializeCrypto(),window.YUVCanvas&&!k&&(k=window.YUVCanvas.attach(t)),c=d.newConn(),c.setMsgbox(F),c.setDraw(p=>{k?.drawFrame(p),document.querySelector("#viewer-empty")?.setAttribute("hidden",""),t.classList.add("is-live"),S(!0)}),await c.start(i)}catch(d){u("error",String(d)),L()}}}),document.querySelector("#password-submit")?.addEventListener("click",Y),document.querySelector("#password-cancel")?.addEventListener("click",L),document.querySelector("#disconnect-button")?.addEventListener("click",L),document.querySelector("#refresh-button")?.addEventListener("click",()=>c?.refresh()),document.querySelector("#cad-button")?.addEventListener("click",()=>c?.ctrlAltDel()),document.querySelector("#fullscreen-button")?.addEventListener("click",()=>document.querySelector("#viewer-shell")?.requestFullscreen()),document.querySelector("#send-text-button")?.addEventListener("click",X),t.addEventListener("contextmenu",s=>s.preventDefault()),t.addEventListener("pointermove",s=>E(s,0)),t.addEventListener("pointerdown",s=>{t.focus(),E(s,1)}),t.addEventListener("pointerup",s=>E(s,2)),t.addEventListener("wheel",s=>{s.preventDefault(),c?.inputMouse(3,Math.round(s.deltaX),Math.round(s.deltaY),s.altKey,s.ctrlKey,s.shiftKey,s.metaKey)},{passive:!1}),t.addEventListener("keydown",s=>x(s,!0)),t.addEventListener("keyup",s=>x(s,!1)),window.addEventListener("rustdesk:event",(s=>{const{name:i,payload:d}=s.detail||{};if(i==="peer_info"){const p=d?.platform||"remote device";document.querySelector("#viewer-meta").textContent=`Connected · ${p}`,u("success",`Connected to ${p}. Waiting for video frames…`),S(!0)}}))}function F(e,t,o){const n=document.querySelector("#password-panel");if(e==="input-password"||e==="re-input-password"){n.hidden=!1,document.querySelector("#remote-password")?.focus(),u("working","Remote password required.");return}if(n.hidden=!0,!e){u("success","Remote video stream is active.");return}u(e==="error"?"error":e==="success"?"success":"working",o||t)}function Y(){const e=document.querySelector("#remote-password"),t=document.querySelector("#remember-password");!c||!e.value||(c.setRemember(t.checked),c.login(e.value),e.value="",document.querySelector("#password-panel").hidden=!0,u("working","Authenticating with the remote device…"))}function L(){w?.close(),c=null,S(!1),u("idle","Disconnected. Enter a server and RustDesk ID to reconnect."),document.querySelector("#remote-canvas")?.classList.remove("is-live"),document.querySelector("#viewer-empty")?.removeAttribute("hidden"),document.querySelector("#password-panel").hidden=!0,document.querySelector("#viewer-meta").textContent="Not connected"}async function V(){return w||(await q("./ogvjs-1.8.6/ogv.js"),await q("./yuv-canvas-1.2.6.js"),w=await _(()=>import("./globals-DsMPRz_g.js"),[],import.meta.url),w)}function q(e){const t=new URL(e,document.baseURI).href;return Array.from(document.scripts).find(n=>n.src===t)?Promise.resolve():new Promise((n,r)=>{const a=document.createElement("script");a.src=t,a.onload=()=>n(),a.onerror=()=>r(new Error(`Unable to load browser runtime: ${e}`)),document.head.appendChild(a)})}function S(e,t=!1){["#refresh-button","#cad-button","#fullscreen-button","#disconnect-button","#remote-text","#send-text-button"].forEach(r=>{const a=document.querySelector(r);a&&(a.disabled=!e)});const n=document.querySelector("#connect-button");n&&(n.disabled=t||e,n.textContent=t?"Connecting…":e?"Connected":"Connect securely"),document.querySelector("#connection-dot")?.classList.toggle("is-live",e)}function u(e,t){const o=document.querySelector("#connection-status");o&&(o.className=`connection-status is-${e}`,o.textContent=t)}function E(e,t){if(!c)return;const o=e.currentTarget,n=o.getBoundingClientRect(),r=Math.round((e.clientX-n.left)*((o.width||n.width)/n.width)),a=Math.round((e.clientY-n.top)*((o.height||n.height)/n.height)),s=e.button===2?2:e.button===1?4:1,i=t?t|s<<3:0;c.inputMouse(i,r,a,e.altKey,e.ctrlKey,e.shiftKey,e.metaKey)}function x(e,t){c&&(e.preventDefault(),c.inputKey(e.key,t,!1,e.altKey,e.ctrlKey,e.shiftKey,e.metaKey))}function X(){const e=document.querySelector("#remote-text");!c||!e?.value||(c.inputString(e.value),e.value="")}function M(e){return e?`${(e/1024/1024).toFixed(1)} MB`:"Unknown size"}function P(e){try{const t=new URL(e);return t.protocol==="https:"&&t.hostname==="github.com"?t.href:g}catch{return g}}function h(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t]||t)}W(document.querySelector("#app"));
//# sourceMappingURL=index-hSm1tJ48.js.map
