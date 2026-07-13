#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

IOS_TARGET="aarch64-apple-ios"
VCPKG_TRIPLET="arm64-ios"
RUST_TOOLCHAIN="${RUST_TOOLCHAIN:-1.75}"
FLUTTER_VERSION="${FLUTTER_VERSION:-3.24.5}"
FRB_VERSION="1.80.1"
CARGO_EXPAND_VERSION="1.0.95"

die() {
    echo "ERROR: $*" >&2
    exit 1
}

require_command() {
    command -v "$1" >/dev/null 2>&1 || die "Required command '$1' was not found."
}

if [[ "$(uname -s)" != "Darwin" ]]; then
    die "iOS builds require macOS with Xcode."
fi

if [[ ! -f "${REPO_ROOT}/libs/hbb_common/Cargo.toml" ]]; then
    die "The hbb_common submodule is missing. Clone RustDesk with 'git clone --recursive' and run the script from that checkout."
fi

for command_name in cargo flutter git pod rustup xcodebuild; do
    require_command "${command_name}"
done

if [[ -z "${VCPKG_ROOT:-}" ]]; then
    die "Set VCPKG_ROOT to a bootstrapped vcpkg checkout before running this script."
fi

if [[ ! -x "${VCPKG_ROOT}/vcpkg" ]]; then
    die "${VCPKG_ROOT}/vcpkg is missing or not executable."
fi

installed_flutter_version="$(flutter --version | sed -n '1s/^Flutter \([^ ]*\).*/\1/p')"
if [[ "${installed_flutter_version}" != "${FLUTTER_VERSION}" ]]; then
    die "Flutter ${FLUTTER_VERSION} is required by this source tree; found ${installed_flutter_version:-unknown}."
fi

flutter_bin="$(command -v flutter)"
flutter_root="$(cd -- "$(dirname -- "${flutter_bin}")/.." && pwd)"
flutter_patch="${REPO_ROOT}/.github/patches/flutter_3.24.4_dropdown_menu_enableFilter.diff"

if git -C "${flutter_root}" apply --reverse --check "${flutter_patch}" >/dev/null 2>&1; then
    echo "Flutter SDK patch is already applied."
elif git -C "${flutter_root}" apply --check "${flutter_patch}" >/dev/null 2>&1; then
    git -C "${flutter_root}" apply "${flutter_patch}"
else
    die "The required Flutter SDK patch cannot be applied cleanly. Reinstall Flutter ${FLUTTER_VERSION} and try again."
fi

rustup toolchain install "${RUST_TOOLCHAIN}" --profile minimal --target "${IOS_TARGET}"

if ! cargo-expand --version 2>/dev/null | grep -q "${CARGO_EXPAND_VERSION}"; then
    cargo +"${RUST_TOOLCHAIN}" install cargo-expand \
        --version "${CARGO_EXPAND_VERSION}" \
        --locked \
        --force
fi

if ! flutter_rust_bridge_codegen --version 2>/dev/null | grep -q "${FRB_VERSION}"; then
    cargo +"${RUST_TOOLCHAIN}" install flutter_rust_bridge_codegen \
        --version "${FRB_VERSION}" \
        --features uuid \
        --locked \
        --force
fi

echo "Building native dependencies for ${VCPKG_TRIPLET}..."
(
    cd "${REPO_ROOT}"
    "${VCPKG_ROOT}/vcpkg" install \
        --triplet "${VCPKG_TRIPLET}" \
        --x-install-root="${VCPKG_ROOT}/installed"
)

echo "Generating the Flutter/Rust bridge..."
(
    cd "${SCRIPT_DIR}"
    flutter pub get
)
(
    cd "${REPO_ROOT}"
    flutter_rust_bridge_codegen \
        --rust-input ./src/flutter_ffi.rs \
        --dart-output ./flutter/lib/generated_bridge.dart \
        --c-output ./flutter/ios/Runner/bridge_generated.h
)

echo "Building the Rust library for ${IOS_TARGET}..."
(
    cd "${REPO_ROOT}"
    cargo +"${RUST_TOOLCHAIN}" build \
        --locked \
        --features flutter,hwcodec \
        --release \
        --target "${IOS_TARGET}" \
        --lib
)

echo "Building the Flutter iOS archive..."
cd "${SCRIPT_DIR}"
if [[ "${IOS_CODESIGN:-0}" == "1" ]]; then
    flutter build ipa --release "$@"
else
    flutter build ipa --release --no-codesign "$@"
fi
