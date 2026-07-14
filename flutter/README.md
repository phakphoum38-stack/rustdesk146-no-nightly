# flutter_hbb

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples and guidance on mobile development, and a full API reference.

Basic build and code generation
-------------------------------

This repository uses `flutter_rust_bridge` to connect the Flutter UI to the
Rust backend. Generate the Dart bridge and macOS/iOS headers from the repository
root with one of these commands:

```powershell
# Windows PowerShell
.\scripts\generate_bridge.ps1
```

```bash
# Linux or macOS
bash ./scripts/generate_bridge.sh
```

For a complete local build of the current host platform, run
`scripts/full_build.ps1` on Windows or `bash scripts/full_build.sh` on Linux and
macOS. Set `VCPKG_ROOT` first; on Windows,
`scripts/setup_build_tools.ps1` can create a project-local vcpkg setup from the
Visual Studio installation.

Desktop packages are native to their build host. To build Windows, macOS,
Linux, Android, iOS, and web outputs together, run **Build Installers for
Supported Platforms** in GitHub Actions. iOS distribution additionally needs
an Apple signing identity and provisioning profile.

Generated bridge files include `flutter/lib/generated_bridge.dart`, Rust files
under `src/`, and `bridge_generated.h` under both `flutter/macos/Runner` and
`flutter/ios/Runner`.
