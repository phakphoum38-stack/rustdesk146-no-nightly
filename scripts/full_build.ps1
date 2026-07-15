[CmdletBinding()]
param(
    [switch]$SkipPortablePack
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$LocalVcpkg = Join-Path $Root '.tools\vcpkg'
$VsWhere = 'C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe'

if ([System.Environment]::OSVersion.Platform -ne [System.PlatformID]::Win32NT) {
    throw 'Use scripts/full_build.sh on Linux or macOS.'
}

if (-not (Get-Command cmake -ErrorAction SilentlyContinue) -and (Test-Path -LiteralPath $VsWhere)) {
    $VsRoot = & $VsWhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.CMake.Project -property installationPath
    $CMakeBin = Join-Path $VsRoot 'Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin'
    $NinjaBin = Join-Path $VsRoot 'Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja'
    if (Test-Path -LiteralPath (Join-Path $CMakeBin 'cmake.exe')) {
        $env:PATH = "$CMakeBin;$NinjaBin;$env:PATH"
    }
}

if (-not $env:VCPKG_ROOT -and (Test-Path -LiteralPath (Join-Path $LocalVcpkg 'vcpkg.exe'))) {
    $env:VCPKG_ROOT = $LocalVcpkg
}

foreach ($command in @('cargo', 'flutter', 'python', 'cmake', 'ninja')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Required command '$command' was not found in PATH."
    }
}

if (-not $env:VCPKG_ROOT -or -not (Test-Path (Join-Path $env:VCPKG_ROOT 'vcpkg.exe'))) {
    throw 'Run scripts/setup_build_tools.ps1 to configure CMake and vcpkg.'
}

& (Join-Path $PSScriptRoot 'generate_bridge.ps1') -Root $Root

$BuildArgs = @('build.py', '--flutter', '--hwcodec', '--vram', '--portable')
if ($SkipPortablePack) {
    $BuildArgs += '--skip-portable-pack'
}

Push-Location $Root
try {
    & python @BuildArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Windows build failed with exit code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}

if ($SkipPortablePack) {
    Write-Host 'Windows application: flutter\build\windows\x64\runner\Release'
} else {
    Write-Host 'Windows installer: rustdesk-*-install.exe'
}
