# Fetch three small GLB demo models into assets/models/{ring,necklace,pendant}
# This script downloads tiny demo glb files for local testing. Run from project root in PowerShell.

$base = "$PSScriptRoot\..\assets\models"
New-Item -Path $base -ItemType Directory -Force | Out-Null

$models = @(
    @{ id = 'ring'; url = 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Boombox/glTF-Binary/Boombox.glb' },
    @{ id = 'necklace'; url = 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb' },
    @{ id = 'pendant'; url = 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Avocado/glTF-Binary/Avocado.glb' }
)

foreach ($m in $models) {
    $dir = Join-Path $base $($m.id)
    New-Item -Path $dir -ItemType Directory -Force | Out-Null
    $dest = Join-Path $dir "model.glb"
    Write-Host "Downloading $($m.id) -> $dest"
    try {
        Invoke-WebRequest -Uri $m.url -OutFile $dest -UseBasicParsing -ErrorAction Stop
        Write-Host "Saved $dest"
    } catch {
        Write-Warning "Failed to download $($m.url): $_"
    }
}

Write-Host "Done. Open project in a local server and test the models."
