#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="$(uname -s)"

for command_name in cargo flutter python3 cmake ninja; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command '$command_name' was not found in PATH." >&2
    exit 1
  fi
done

if [[ -z "${VCPKG_ROOT:-}" || ! -x "$VCPKG_ROOT/vcpkg" ]]; then
  echo 'VCPKG_ROOT must point to a bootstrapped vcpkg installation.' >&2
  exit 1
fi

bash "$ROOT/scripts/generate_bridge.sh" "$ROOT"

case "$HOST" in
  Linux|Darwin)
    BUILD_ARGS=(--flutter --hwcodec --unix-file-copy-paste)
    ;;
  *)
    echo 'Use scripts/full_build.ps1 on Windows.' >&2
    exit 1
    ;;
esac

(cd "$ROOT" && python3 build.py "${BUILD_ARGS[@]}")

case "$HOST" in
  Linux)
    echo 'Linux package created in the repository root (format depends on the distribution).'
    ;;
  Darwin)
    echo 'macOS application: flutter/build/macos/Build/Products/Release/RustDesk.app'
    echo 'Use GitHub Actions for signed and notarized release packages.'
    ;;
esac
