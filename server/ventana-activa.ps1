# Cada 15 segundos escribe una línea JSON con el programa que está delante, el título de su ventana y
# cuántos segundos llevas sin tocar teclado ni mouse. Lo lee server/uso-laptop.js. No toma capturas.
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class VentanaActiva {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint id);
  [StructLayout(LayoutKind.Sequential)] public struct ULTIMA { public uint cbSize; public uint dwTime; }
  [DllImport("user32.dll")] public static extern bool GetLastInputInfo(ref ULTIMA u);
}
"@
[Console]::OutputEncoding = [Text.Encoding]::UTF8
while ($true) {
  $h = [VentanaActiva]::GetForegroundWindow()
  $texto = New-Object Text.StringBuilder 512
  [void][VentanaActiva]::GetWindowText($h, $texto, 512)
  $id = 0
  [void][VentanaActiva]::GetWindowThreadProcessId($h, [ref]$id)
  $app = ''
  try { $app = (Get-Process -Id $id -ErrorAction Stop).ProcessName } catch {}
  $u = New-Object VentanaActiva+ULTIMA
  $u.cbSize = 8
  [void][VentanaActiva]::GetLastInputInfo([ref]$u)
  $quieto = [int](([uint32][Environment]::TickCount - $u.dwTime) / 1000)
  @{ app = $app; titulo = $texto.ToString(); quieto = $quieto } | ConvertTo-Json -Compress
  Start-Sleep -Seconds 15
}
