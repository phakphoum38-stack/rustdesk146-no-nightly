#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
FLUTTER_DIR="$ROOT/flutter"
RUST_INPUT="$ROOT/src/flutter_ffi.rs"
DART_OUTPUT="$FLUTTER_DIR/lib/generated_bridge.dart"
MAC_HEADER="$FLUTTER_DIR/macos/Runner/bridge_generated.h"
IOS_HEADER="$FLUTTER_DIR/ios/Runner/bridge_generated.h"
BRIDGE_VERSION="1.80.1"
CARGO_EXPAND_VERSION="1.0.95"

for command_name in cargo flutter; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command '$command_name' was not found in PATH." >&2
    exit 1
  fi
done

if ! command -v cargo-expand >/dev/null 2>&1 ||
  ! cargo-expand --version 2>/dev/null | grep -Fq "$CARGO_EXPAND_VERSION"; then
  cargo install cargo-expand --version "$CARGO_EXPAND_VERSION" --locked --force
fi

if ! command -v flutter_rust_bridge_codegen >/dev/null 2>&1 ||
  ! flutter_rust_bridge_codegen --version 2>/dev/null | grep -Fq "$BRIDGE_VERSION"; then
  cargo install flutter_rust_bridge_codegen \
    --version "$BRIDGE_VERSION" \
    --features uuid \
    --locked \
    --force
fi

(cd "$FLUTTER_DIR" && flutter pub get)

flutter_rust_bridge_codegen \
  --rust-input "$RUST_INPUT" \
  --dart-output "$DART_OUTPUT" \
  --c-output "$MAC_HEADER"

cp "$MAC_HEADER" "$IOS_HEADER"
echo 'Generated Flutter bridge and macOS/iOS headers.'
