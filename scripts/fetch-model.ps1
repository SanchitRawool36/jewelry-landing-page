# Download and extract the Diamond glTF sample into assets/models/diamond/
# Run this from the project root (e:\jewelry-landing-page) in PowerShell.

$zipUrl = 'https://github.com/KhronosGroup/glTF-Sample-Models/archive/refs/heads/master.zip'
$tempZip = "$env:TEMP\glTF-Sample-Models-master.zip"
$tempDir = "$env:TEMP\glTF-Sample-Models-master"
$dest = "assets/models/diamond"

Write-Output "Downloading sample models..."
Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing

Write-Output "Extracting..."
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
Expand-Archive -Path $tempZip -DestinationPath $tempDir

Write-Output "Copying Diamond model files to $dest"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item -Path "$tempDir\glTF-Sample-Models-master\2.0\Diamond\glTF\*" -Destination $dest -Recurse

Write-Output "Cleaning up..."
Remove-Item -Recurse -Force $tempZip, $tempDir

Write-Output "Done. Model files are in $dest"
