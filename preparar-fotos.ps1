# preparar-fotos.ps1
# Copia y achica las fotos de Mateverso con los nombres que usa el catalogo.
# Las fotos ORIGINALES no se tocan: solo se leen.
#
# Uso (desde la carpeta del repo, donde esta plan-fotos.csv):
#   .\preparar-fotos.ps1 -Origen "C:\ruta\a\PRODUCTOS" -Prueba     # prueba con 3 fotos
#   .\preparar-fotos.ps1 -Origen "C:\ruta\a\PRODUCTOS"             # las 308 fotos

param(
    [Parameter(Mandatory = $true)][string]$Origen,
    [string]$Plan = ".\plan-fotos.csv",
    [string]$Salida = ".",
    [int]$LadoMax = 900,
    [int]$Calidad = 82,
    [switch]$Prueba
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $Origen)) { Write-Host "No existe la carpeta de origen: $Origen" -ForegroundColor Red; exit 1 }
if (-not (Test-Path $Plan))   { Write-Host "No encuentro el plan: $Plan" -ForegroundColor Red; exit 1 }

# Indice de todas las fotos del origen (busca en todas las subcarpetas)
Write-Host "Leyendo fotos de $Origen ..."
$indice = @{}
Get-ChildItem -Path $Origen -Recurse -File | ForEach-Object { $indice[$_.Name.ToLower()] = $_.FullName }
Write-Host "Fotos encontradas: $($indice.Count)"

# GDI+ necesita rutas completas (con rutas relativas falla con "Error generico")
$SalidaCompleta = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Salida)

$filas = Import-Csv -Path $Plan -Delimiter ";" -Encoding UTF8
if ($Prueba) { $filas = $filas | Select-Object -First 3 }

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$parametros = New-Object System.Drawing.Imaging.EncoderParameters(1)
$parametros.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)

$ok = 0
$faltan = @()
$errores = @()

foreach ($fila in $filas) {
    $clave = $fila.archivo.ToLower()
    if (-not $indice.ContainsKey($clave)) { $faltan += $fila.archivo; continue }

    $destino = [System.IO.Path]::GetFullPath((Join-Path $SalidaCompleta $fila.destino))
    New-Item -ItemType Directory -Force -Path (Split-Path $destino) | Out-Null

    try {
        $origenImg = [System.Drawing.Image]::FromFile($indice[$clave])

        # Respetar la rotacion de las fotos sacadas con celular
        if ($origenImg.PropertyIdItems | Where-Object { $_.Id -eq 0x0112 }) {
            $orient = $origenImg.GetPropertyItem(0x0112).Value[0]
            switch ($orient) {
                3 { $origenImg.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                6 { $origenImg.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                8 { $origenImg.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
            }
        }

        # Achicar manteniendo la proporcion (nunca agrandar)
        $escala = [Math]::Min(1.0, $LadoMax / [Math]::Max($origenImg.Width, $origenImg.Height))
        $ancho = [int]($origenImg.Width * $escala)
        $alto = [int]($origenImg.Height * $escala)

        $nueva = New-Object System.Drawing.Bitmap($ancho, $alto)
        $g = [System.Drawing.Graphics]::FromImage($nueva)
        $g.Clear([System.Drawing.Color]::White)   # fondo blanco para los PNG con transparencia
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($origenImg, 0, 0, $ancho, $alto)
        $g.Dispose()

        $nueva.Save($destino, $codec, $parametros)
        $nueva.Dispose()
        $origenImg.Dispose()
        $ok++
    }
    catch {
        $errores += "$($fila.archivo): $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Listo. Fotos generadas: $ok de $($filas.Count)" -ForegroundColor Green
if ($faltan.Count -gt 0) {
    Write-Host "No encontre estas fotos en el origen ($($faltan.Count)):" -ForegroundColor Yellow
    $faltan | ForEach-Object { Write-Host "  $_" }
}
if ($errores.Count -gt 0) {
    Write-Host "Fallaron ($($errores.Count)):" -ForegroundColor Red
    $errores | ForEach-Object { Write-Host "  $_" }
}
