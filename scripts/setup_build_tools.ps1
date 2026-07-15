[CmdletBinding()]
param(
    [switch]$PersistUserEnvironment
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ToolsRoot = Join-Path $Root '.tools'
$LocalVcpkg = Join-Path $ToolsRoot 'vcpkg'
$VsWhere = 'C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe'

if (-not (Test-Path -LiteralPath $VsWhere)) {
    throw 'Visual Studio Installer (vswhere.exe) was not found.'
}

$VsRoot = & $VsWhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.CMake.Project -property installationPath
if (-not $VsRoot) {
    throw 'A Visual Studio installation with the C++ CMake tools was not found.'
}

$CMakeBin = Join-Path $VsRoot 'Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin'
$NinjaBin = Join-Path $VsRoot 'Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja'
$BundledVcpkg = Join-Path $VsRoot 'VC\vcpkg'

foreach ($path in @(
    (Join-Path $CMakeBin 'cmake.exe'),
    (Join-Path $NinjaBin 'ninja.exe'),
    (Join-Path $BundledVcpkg 'vcpkg.exe')
)) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Required Visual Studio build tool was not found: $path"
    }
}

New-Item -ItemType Directory -Path $ToolsRoot -Force | Out-Null
if (-not (Test-Path -LiteralPath (Join-Path $LocalVcpkg 'vcpkg.exe'))) {
    Copy-Item -LiteralPath $BundledVcpkg -Destination $LocalVcpkg -Recurse
}

$env:VCPKG_ROOT = $LocalVcpkg
$env:PATH = "$CMakeBin;$NinjaBin;$LocalVcpkg;$env:PATH"

if ($PersistUserEnvironment) {
    [Environment]::SetEnvironmentVariable('VCPKG_ROOT', $LocalVcpkg, 'User')
    $UserPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    foreach ($entry in @($CMakeBin, $NinjaBin, $LocalVcpkg)) {
        if (($UserPath -split ';') -notcontains $entry) {
            $UserPath = if ($UserPath) { "$entry;$UserPath" } else { $entry }
        }
    }
    [Environment]::SetEnvironmentVariable('Path', $UserPath, 'User')
}

& (Join-Path $CMakeBin 'cmake.exe') --version | Select-Object -First 1
& (Join-Path $NinjaBin 'ninja.exe') --version
& (Join-Path $LocalVcpkg 'vcpkg.exe') version | Select-Object -First 1
Write-Host "VCPKG_ROOT=$LocalVcpkg"
