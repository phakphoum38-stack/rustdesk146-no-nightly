[CmdletBinding()]
param(
    [string]$Root = (Join-Path $PSScriptRoot '..')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$BridgeVersion = '1.80.1'
$CargoExpandVersion = '1.0.95'
$Root = (Resolve-Path -LiteralPath $Root).Path
$FlutterDir = Join-Path $Root 'flutter'
$RustInput = Join-Path $Root 'src\flutter_ffi.rs'
$DartOutput = Join-Path $FlutterDir 'lib\generated_bridge.dart'
$MacHeader = Join-Path $FlutterDir 'macos\Runner\bridge_generated.h'
$IosHeader = Join-Path $FlutterDir 'ios\Runner\bridge_generated.h'

foreach ($command in @('cargo', 'flutter')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Required command '$command' was not found in PATH."
    }
}

function Install-CargoTool {
    param(
        [Parameter(Mandatory)] [string]$Command,
        [Parameter(Mandatory)] [string]$Crate,
        [Parameter(Mandatory)] [string]$Version,
        [string[]]$ExtraArgs = @()
    )

    $Installed = Get-Command $Command -ErrorAction SilentlyContinue
    if ($Installed) {
        $VersionOutput = & $Installed.Source --version 2>$null
        if ($LASTEXITCODE -eq 0 -and $VersionOutput -match [regex]::Escape($Version)) {
            return
        }
    }

    & cargo install $Crate --version $Version --locked --force @ExtraArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install $Crate $Version."
    }
}

Install-CargoTool -Command 'cargo-expand' -Crate 'cargo-expand' -Version $CargoExpandVersion
Install-CargoTool -Command 'flutter_rust_bridge_codegen' -Crate 'flutter_rust_bridge_codegen' -Version $BridgeVersion -ExtraArgs @('--features', 'uuid')

Push-Location $FlutterDir
try {
    & flutter pub get
    if ($LASTEXITCODE -ne 0) {
        throw "flutter pub get failed with exit code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}

$Codegen = Get-Command flutter_rust_bridge_codegen -ErrorAction Stop
& $Codegen.Source `
    --rust-input $RustInput `
    --dart-output $DartOutput `
    --c-output $MacHeader
if ($LASTEXITCODE -ne 0) {
    throw "Bridge generation failed with exit code $LASTEXITCODE."
}

Copy-Item -LiteralPath $MacHeader -Destination $IosHeader -Force
Write-Host 'Generated Flutter bridge and macOS/iOS headers.'
