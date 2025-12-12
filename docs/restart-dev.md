## Reiniciar el entorno dev de Proactivitis

Esta carpeta queda inestable cuando:

- Se crea/n ruta/asignación nueva y Next aún mantiene el mapa viejo.
- Queda un proceso `next dev` anterior ocupando el puerto.
- Se rompe el lock en `.next/dev/lock` porque el servidor no terminó correctamente.

### Paso a paso

1. Cierra cualquier instancia anterior de Next:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000,3001 | Stop-Process -Force -Id {$_.OwningProcess}
   ```
   (Si te da error, ejecuta `Get-Process node` y mata manualmente el PID correcto.)

2. Elimina el build viejo y el lock:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```

3. Vuelve a arrancar el servidor:
   ```powershell
   npm run dev
   ```

4. Si usas un puerto fijo, puedes pasar `PORT=3000` (Unix) o `set PORT=3000` (Windows) antes de lanzar el dev server.

Con eso el portal por rol y todos los paneles deberían compilar sin errores de `source map` ni `params.role`. Si quieres puedo convertir estos pasos en un script `.ps1` para ejecutarlos automáticamente. ¿Te parece útil? 
