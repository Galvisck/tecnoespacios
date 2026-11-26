# Pruebas automáticas de extremo a extremo de los módulos comerciales.
# Ejecutar con Netlify Dev activo en http://localhost:8888:
#   powershell -ExecutionPolicy Bypass -File .\PRUEBAS_COMERCIALES.ps1
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8888'
$auth = '102eadf5a95f7d262edefb1f2888cb8ded09635c5d71fa6c21d2def3902c299e'
$registro = New-Object System.Collections.Generic.List[object]

function Check([string]$nombre, [bool]$ok, [string]$detalle = '') {
  $registro.Add([pscustomobject]@{ Prueba = $nombre; Resultado = $(if ($ok) { 'OK' } else { 'FALLO' }); Detalle = $detalle })
  Write-Host ("[{0}] {1}{2}" -f $(if ($ok) { 'OK' } else { 'FALLO' }), $nombre, $(if ($detalle) { ' — ' + $detalle } else { '' }))
}

function Get-Page([string]$ruta) {
  try {
    $r = Invoke-WebRequest -Uri ($base + $ruta) -UseBasicParsing -TimeoutSec 8
    return [pscustomobject]@{ Code = [int]$r.StatusCode; Text = $r.Content }
  } catch {
    $resp = $_.Exception.Response
    if ($resp) { return [pscustomobject]@{ Code = [int]$resp.StatusCode; Text = '' } }
    return [pscustomobject]@{ Code = 0; Text = $_.Exception.Message }
  }
}

function Post-Json([string]$ruta, $cuerpo) {
  $json = $cuerpo | ConvertTo-Json -Depth 30 -Compress
  try {
    $r = Invoke-WebRequest -Uri ($base + $ruta) -Method Post -ContentType 'application/json' -Body $json -UseBasicParsing -TimeoutSec 15
    $code = [int]$r.StatusCode; $txt = $r.Content
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $code = [int]$resp.StatusCode
      $sr = New-Object IO.StreamReader($resp.GetResponseStream())
      $txt = $sr.ReadToEnd()
    } else { $code = 0; $txt = $_.Exception.Message }
  }
  $obj = $null
  try { $obj = $txt | ConvertFrom-Json } catch { }
  return [pscustomobject]@{ Code = $code; Raw = $txt; Json = $obj }
}

# Espera breve a que Netlify Dev termine de cargar las funciones.
for ($i = 0; $i -lt 40; $i++) {
  $inicio = Get-Page '/'
  if ($inicio.Code -eq 200) { break }
  Start-Sleep -Milliseconds 500
}

Check 'Servidor local responde' ($inicio.Code -eq 200) "HTTP $($inicio.Code)"
Check 'Personalizador Sirve SPA' ((Get-Page '/personalizador').Code -eq 200)
Check 'Seguimiento Sirve SPA' ((Get-Page '/seguimiento').Code -eq 200)
Check 'Catálogo cargado en la página' ($inicio.Text -match 'catalogo\.js')
Check 'Módulo comercial cargado en la página' ($inicio.Text -match 'comercial\.js')
$mapa = Get-Page '/sitemap.xml'
Check 'Sitemap incluye /personalizador' ($mapa.Text -match '/personalizador')
Check 'Sitemap incluye /seguimiento' ($mapa.Text -match '/seguimiento')

$ev = Post-Json '/.netlify/functions/eventos' @{ tipo = 'visita'; sid = 'prueba-api'; meta = @{ slug = 'inicio' } }
Check 'Evento anónimo registrado' ($ev.Code -eq 200 -and $ev.Json.ok -eq 1) "HTTP $($ev.Code)"

$sinAuth = Post-Json '/.netlify/functions/comercial' @{ accion = 'listar'; que = 'contactos' }
Check 'Panel bloquea acceso sin credencial' ($sinAuth.Code -eq 401) "HTTP $($sinAuth.Code)"

$sello = [DateTime]::UtcNow.Ticks
$correo = "prueba+$sello@ejemplo.com"
$color = @{
  catalogId = 'colores|Terranta'; n = 'Terranta'; s = 'Vetta'; d = 'Duratex Colombia'; x = '#b9855a'
  img = 'img/cat/colores-terranta.jpg'; source = 'catalogo'; parte = 'puertas'
}
$solicitud = @{
  accion = 'solicitud'; origen = 'personalizador'; nombre = 'Cliente Prueba API'; email = $correo
  tel = '3001234567'; ciudad = 'Bogotá'; tipo = 'Cocina integral'; modelo = 'Moderno'
  medidas = @{ ancho = 240; alto = 220; profundo = 60; unidad = 'cm' }
  colores = @($color); observaciones = 'Prueba automatizada'; crearProyecto = $true
  sid = 'prueba-api'
}
$sol = Post-Json '/.netlify/functions/comercial' $solicitud
Check 'Solicitud pública creada con proyecto' ($sol.Code -eq 200 -and $sol.Json.ok -eq 1 -and $sol.Json.proyecto.codigo) "HTTP $($sol.Code)"
$codigo = [string]$sol.Json.proyecto.codigo
Check 'Código de seguimiento con formato TE-YYYYMMDD-XXXX' ($codigo -match '^TE-\d{8}-[0-9A-F]{4}$') $codigo

$sol2 = Post-Json '/.netlify/functions/comercial' $solicitud
Check 'Reenvío idéntico no crea otro contacto' ($sol2.Code -eq 200 -and $sol2.Json.ok -eq 1) "HTTP $($sol2.Code)"

$contactos = Post-Json '/.netlify/functions/comercial' @{ accion = 'listar'; que = 'contactos'; auth = $auth }
$coincidencias = @($contactos.Json.contactos | Where-Object { $_.email -eq $correo }).Count
Check 'Deduplicación por correo' ($coincidencias -eq 1) "coincidencias=$coincidencias"

$config = Post-Json '/.netlify/functions/comercial' @{ accion = 'configSet'; auth = $auth; listas = @{ modelos = @('Moderno', 'Rústico'); materiales = @('Madera', 'Mármol') } }
Check 'Configuración del personalizador guardada' ($config.Code -eq 200 -and $config.Json.ok -eq 1) "HTTP $($config.Code)"
$config2 = Post-Json '/.netlify/functions/comercial' @{ accion = 'listar'; que = 'config'; auth = $auth }
Check 'Configuración persistida' (@($config2.Json.config.listas.modelos) -contains 'Rústico')

$proyectos = Post-Json '/.netlify/functions/proyectos' @{ accion = 'listar'; auth = $auth }
Check 'Proyecto visible en el panel' (@($proyectos.Json.proyectos | Where-Object { $_.codigo -eq $codigo }).Count -eq 1)

$falla = Post-Json '/.netlify/functions/proyectos' @{ accion = 'verificar'; codigo = $codigo; verificacion = 'dato-incorrecto' }
Check 'Verificación pública rechaza dato incorrecto' ($falla.Code -eq 403) "HTTP $($falla.Code)"

$ver = Post-Json '/.netlify/functions/proyectos' @{ accion = 'verificar'; codigo = $codigo; verificacion = $correo }
$p = $ver.Json.proyecto
Check 'Verificación pública con correo' ($ver.Code -eq 200 -and $p.codigo -eq $codigo) "HTTP $($ver.Code)"
Check 'Respuesta pública no expone contacto ni hashes' ($null -eq $p.contactId -and $null -eq $p.verif -and $null -eq $p.cliente)

$nota = Post-Json '/.netlify/functions/proyectos' @{ accion = 'nota'; auth = $auth; id = $p.id; texto = 'Avance de prueba automatizada' }
Check 'Novedad de seguimiento guardada' ($nota.Code -eq 200 -and @($nota.Json.proyecto.notas).Count -ge 1) "HTTP $($nota.Code)"
$estado = Post-Json '/.netlify/functions/proyectos' @{ accion = 'estado'; auth = $auth; id = $p.id; estado = 'En fabricación' }
Check 'Cambio de estado guardado' ($estado.Code -eq 200 -and $estado.Json.proyecto.estado -eq 'En fabricación') "HTTP $($estado.Code)"
$foto = Post-Json '/.netlify/functions/proyectos' @{ accion = 'foto'; auth = $auth; id = $p.id; url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }
Check 'Fotografía de avance guardada' ($foto.Code -eq 200 -and @($foto.Json.proyecto.fotos).Count -ge 1) "HTTP $($foto.Code)"

$stats = Post-Json '/.netlify/functions/estadisticas' @{ accion = 'stats'; dias = 30; auth = $auth }
Check 'Estadísticas reales disponibles' ($stats.Code -eq 200 -and $stats.Json.ok -eq 1 -and $stats.Json.resumen.solicitudes -ge 1) "HTTP $($stats.Code)"
Check 'Entorno de prueba correctamente marcado' ($stats.Json.esPrueba -eq $true -and $stats.Json.entorno -eq 'desarrollo')
Check 'Sin datos personales en estadísticas' (-not $stats.Raw.Contains($correo))

$persistencia = Post-Json '/.netlify/functions/proyectos' @{ accion = 'listar'; auth = $auth }
$p2 = @($persistencia.Json.proyectos | Where-Object { $_.codigo -eq $codigo })[0]
Check 'Persistencia tras varias escrituras' ($p2.estado -eq 'En fabricación' -and @($p2.fotos).Count -ge 1 -and @($p2.historial).Count -ge 2)

$salida = $registro | Format-Table -AutoSize | Out-String
Write-Host $salida
$fallos = @($registro | Where-Object { $_.Resultado -eq 'FALLO' }).Count
Write-Host ("RESUMEN: {0} pruebas, {1} fallos" -f $registro.Count, $fallos)
if ($fallos -gt 0) { exit 1 }
