# RustDesk web portal and Remote Lab

This directory contains two browser experiences that are deliberately separated
from the native Flutter application:

1. **Downloads** is the supported static portal. It discovers the assets in the
   `v1.4.9-custom` GitHub prerelease and recommends a package for the visitor's
   platform.
2. **Remote Lab** is an experimental browser client. It restores the protocol
   engine from RustDesk's former web v1 implementation, regenerates TypeScript
   bindings from the current `libs/hbb_common/protos`, and provides a standalone
   UI for relay connections, authentication, video, pointer, keyboard,
   clipboard, and audio.

Remote Lab is not feature-equivalent to the native application. Direct NAT
traversal, file transfer, multiple native windows, hardware decoding, and
unattended browser hosting are not implemented.

## Build locally

Node.js 24 is used in CI.

```bash
cd web
npm ci
npm audit --omit=dev --audit-level=high
npm run build
npm run preview
```

`npm run build` performs four operations:

- generates `message.ts` and `rendezvous.ts` from the current RustDesk protobuf
  files;
- downloads RustDesk's official browser decoder bundle and verifies its pinned
  SHA-256 digest;
- type-checks the web client;
- produces a static site in `web/dist/`.

Generated protocol files, downloaded decoder files, caches, and `dist/` are not
committed.

## Browser connection requirements

The RustDesk rendezvous WebSocket port is derived from the server's base port
(`21116 + 2`), and the relay WebSocket port is derived from the relay response.

- A portal served over HTTPS must connect through **WSS**. Configure a TLS
  reverse proxy for the RustDesk WebSocket ports and select `WSS` in Remote Lab.
- Plain `ws://` connections are blocked as mixed content on an HTTPS page. They
  can be used when the portal is served locally over HTTP.
- The server key and endpoint are stored only in browser local storage. The
  password itself is not persisted; when requested, the optional remember mode
  stores the RustDesk password hash used by the protocol engine.

## GitHub publishing

Run **Build and Deploy Web Portal** in GitHub Actions. The workflow:

- builds and audits the site;
- attaches `rustdesk-1.4.9-web.tar.gz` to the selected prerelease;
- retains the unpacked site as a workflow artifact;
- deploys the site to GitHub Pages when `deploy_pages` is enabled.

The reusable native packaging workflow also builds and uploads the web archive,
so future all-platform releases include the site automatically.
