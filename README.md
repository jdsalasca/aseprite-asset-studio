# Aseprite Asset Studio

## Diagnóstico y REST

El gateway expone GET /api/diagnostics y GET /api/aseprite/detect. Las llamadas de edición pasan por el gateway y el protocolo MCP; el MCP también puede publicar controles REST locales cuando se inicia con MCP_REST_PORT. Esos controles son adaptadores del mismo dominio, no una segunda implementación.

Interfaz Vite + React + TypeScript para operar `aseprite-asset-mcp` con una guía de configuración humana. Los componentes visuales provienen del paquete independiente [`@jdsalasc/pixel-ui`](https://github.com/jdsalasca/pixel-art-ui). Mientras se completa la primera publicación npm, la dependencia usa un commit Git fijado para reproducibilidad.

## Arranque local

Desde esta carpeta, en dos terminales:

```text
npm install
npm run gateway
npm run dev
```

Abre `http://localhost:4173`, selecciona la carpeta de `aseprite-mcp`, indica opcionalmente la ruta de Aseprite y pulsa **START MCP**.

El gateway local utiliza el cliente MCP oficial sobre stdio. El navegador solo llama a `127.0.0.1:3765`; no ejecuta procesos ni recibe acceso directo al sistema de archivos.

La arquitectura está separada por dominio, casos de uso, puertos y adaptadores: `src/domain`, `src/application`, `src/ports` y `src/adapters`.

Variables opcionales:

```text
MCP_REPO_PATH=C:\\Users\\jdsal\\Documents\\Programming-personal\\aseprite-mcp
ASEPRITE_PATH=C:\\Program Files\\Aseprite\\Aseprite.exe
ASSET_STUDIO_GATEWAY_PORT=3765
MCP_REST_PORT=3766
ASSET_STUDIO_UPLOAD_DIR=C:\\Users\\jdsal\\Documents\\Programming-personal\\asset-studio\\.asset-studio\\uploads
```

Los assets cargados se validan por extensión, limitan a 32 MB y se guardan mediante el adaptador `LocalAssetStore`; el navegador no escribe directamente en el filesystem.

## Flujo rápido de producción

- Carga un PNG, GIF, WebP o archivo Aseprite; el cliente rechaza formatos no soportados y archivos mayores de 25 MB antes de subirlos.
- Usa `INSPECT REFERENCE` para generar un plan determinista y revisa el antes/después antes de aplicar.
- Los paneles `MATERIAL ENHANCER` y `DEPTH LIGHTING` crean salidas separadas con seed, granularidad y luz direccional reproducibles.
- `SPRITE EFFECTS` añade outline, color grade, sombra, partículas y normal map con outputs separados.
- `RECIPE CREATOR` genera un plan MCP determinista con pasos seleccionables, material, luz y seed para revisión humana.
- `EXECUTE RECIPE` ejecuta el pipeline seleccionado en el servicio compartido del MCP, muestra cada paso, conserva el original y carga el artifact final en la comparación.
- `BACKGROUND ASSET JOB` permite presets PNG, animación, GIF y atlas; muestra progreso y artifacts con hash.
- Filtra herramientas y logs desde la UX. Atajos: `Ctrl+I` inspeccionar, `Ctrl+Enter` aplicar, `Ctrl+J` iniciar job.
- El panel de métricas ayuda a detectar latencia y fallos del gateway sin abrir logs del proveedor.

El Studio detecta Aseprite en la ruta configurada, en `ASEPRITE_PATH` y en rutas comunes. Al pulsar `START MCP` lanza el servidor por stdio, propaga `MCP_REST_PORT` y expone diagnósticos de runtime, detección y último error. Los endpoints REST del MCP permanecen en el repositorio MCP y reutilizan sus mismos servicios de dominio.
