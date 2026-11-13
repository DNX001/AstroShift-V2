$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$projectRoot = (Get-Location).Path

if (!(Test-Path (Join-Path $projectRoot 'frontend\package.json'))) {
    throw 'Run this script from the AstroShift project root.'
}

$destination = Join-Path $projectRoot 'frontend\public\environments\earth'

New-Item -ItemType Directory -Force -Path $destination | Out-Null

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$assets = @(
    [pscustomobject]@{
        Name = 'earth-day-bmng.jpg'
        Url = 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/january/world.topo.bathy.200401.3x5400x2700.jpg'
    }
    [pscustomobject]@{
        Name = 'earth-night-blackmarble.jpg'
        Url = 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg'
    }
    [pscustomobject]@{
        Name = 'earth-clouds-alpha.png'
        Url = 'https://clouds.matteason.co.uk/images/4096x2048/clouds-alpha.png'
    }
    [pscustomobject]@{
        Name = 'earth-water-specular.jpg'
        Url = 'https://clouds.matteason.co.uk/images/4096x2048/specular.jpg'
    }
)

Write-Host ''
Write-Host 'ASTRA-01 EARTH TEXTURE DOWNLOAD' -ForegroundColor Cyan
Write-Host 'Destination:'
Write-Host $destination
Write-Host ''

foreach ($asset in $assets) {

    $target = Join-Path $destination $asset.Name
    $temporary = $target + '.download'

    Write-Host ('Downloading: ' + $asset.Name) -ForegroundColor Yellow

    try {
        Invoke-WebRequest `
            -Uri $asset.Url `
            -OutFile $temporary `
            -Headers @{ 'User-Agent' = 'Mozilla/5.0 AstroShift asset setup' } `
            -TimeoutSec 180 `
            -UseBasicParsing

        $file = Get-Item -LiteralPath $temporary

        if ($file.Length -lt 10000) {
            throw 'Downloaded file is unexpectedly small.'
        }

        $stream = [System.IO.File]::OpenRead($temporary)

        try {
            $header = New-Object byte[] 8
            $bytesRead = $stream.Read($header, 0, 8)
        }
        finally {
            $stream.Dispose()
        }

        $extension = [System.IO.Path]::GetExtension($asset.Name).ToLowerInvariant()

        if ($extension -eq '.jpg') {
            $validImage = (
                $bytesRead -ge 3 -and
                $header[0] -eq 255 -and
                $header[1] -eq 216 -and
                $header[2] -eq 255
            )
        }
        elseif ($extension -eq '.png') {
            $validImage = (
                $bytesRead -ge 8 -and
                $header[0] -eq 137 -and
                $header[1] -eq 80 -and
                $header[2] -eq 78 -and
                $header[3] -eq 71
            )
        }
        else {
            $validImage = $false
        }

        if (!$validImage) {
            throw 'Downloaded content is not a valid image file.'
        }

        Move-Item -LiteralPath $temporary -Destination $target -Force

        $size = (Get-Item -LiteralPath $target).Length

        Write-Host (
            '  OK: ' + $asset.Name + ' (' + $size.ToString('N0') + ' bytes)'
        ) -ForegroundColor Green
    }
    catch {
        Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
        throw ('Failed downloading ' + $asset.Name + ': ' + $_.Exception.Message)
    }
}

Write-Host ''
Write-Host 'EARTH TEXTURES READY' -ForegroundColor Green

Get-ChildItem -LiteralPath $destination -File |
    Select-Object Name, Length |
    Format-Table -AutoSize

Write-Host 'SHA-256 CHECKSUMS' -ForegroundColor Cyan

Get-ChildItem -LiteralPath $destination -File |
    Get-FileHash -Algorithm SHA256 |
    Select-Object Path, Hash |
    Format-Table -AutoSize