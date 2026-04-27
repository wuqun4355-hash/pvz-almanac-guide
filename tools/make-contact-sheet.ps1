$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Web.Extensions

$raw = Get-Content -Raw -Encoding UTF8 "src/data.generated.js"
$json = $raw -replace "^//.*\r?\nwindow\.PVZ_DATA = ", "" -replace ";\s*$", ""
$serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$serializer.MaxJsonLength = 20000000
$data = $serializer.DeserializeObject($json)

New-Item -ItemType Directory -Force -Path "qa" | Out-Null

function New-ContactSheet($items, $path, $title) {
  $cols = 7
  $cellW = 170
  $cellH = 190
  $rows = [Math]::Ceiling($items.Count / $cols)
  $w = $cols * $cellW
  $h = 48 + $rows * $cellH

  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(245,247,242))

  $titleFont = New-Object System.Drawing.Font("Microsoft YaHei", 15, [System.Drawing.FontStyle]::Bold)
  $font = New-Object System.Drawing.Font("Microsoft YaHei", 8)
  $g.DrawString($title, $titleFont, [System.Drawing.Brushes]::Black, 10, 10)

  for ($i = 0; $i -lt $items.Count; $i++) {
    $item = $items[$i]
    $col = $i % $cols
    $row = [Math]::Floor($i / $cols)
    $x = $col * $cellW
    $y = 48 + $row * $cellH

    $rectBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($rectBrush, $x + 6, $y + 6, $cellW - 12, $cellH - 12)
    $rectBrush.Dispose()

    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(215,226,210))
    $g.DrawRectangle($pen, $x + 6, $y + 6, $cellW - 12, $cellH - 12)
    $pen.Dispose()

    $imgPath = Join-Path (Get-Location) $item["icon"]
    if (Test-Path $imgPath) {
      $img = [System.Drawing.Image]::FromFile($imgPath)
      $maxW = 130
      $maxH = 112
      $scale = [Math]::Min($maxW / $img.Width, $maxH / $img.Height)
      if ($scale -gt 1) { $scale = 1 }
      $dw = [int]($img.Width * $scale)
      $dh = [int]($img.Height * $scale)
      $dx = $x + [int](($cellW - $dw) / 2)
      $dy = $y + 18 + [int](($maxH - $dh) / 2)
      $g.DrawImage($img, $dx, $dy, $dw, $dh)
      $img.Dispose()
    }

    if ($item.ContainsKey("en")) {
      $label = "$($item["cn"]) / $($item["en"])"
    } else {
      $label = "$($item["cn"]) / $($item["title"])"
    }
    $g.DrawString($label, $font, [System.Drawing.Brushes]::Black, $x + 12, $y + 136)
    $g.DrawString($item["icon"], $font, [System.Drawing.Brushes]::DimGray, $x + 12, $y + 154)
  }

  $fullPath = Join-Path (Get-Location) $path
  $bmp.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  Write-Output "saved $fullPath"
}

New-ContactSheet $data["plants"] "qa/plants-contact.png" "Plants icon QA"
New-ContactSheet $data["zombies"] "qa/zombies-contact.png" "Zombies icon QA"
New-ContactSheet $data["levels"] "qa/levels-contact.png" "Levels icon QA"
