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

La presentación mantiene la misma disciplina: `src/styles/app.scss` compone los módulos
`_tokens.scss`, `_foundation.scss`, `_layout.scss`, `_components.scss` y `_mixins.scss`.
No hay superclases Sass ni estilos acoplados al dominio; los componentes React
implementan props HTML tipados y la hoja SCSS solo conoce clases de presentación. El
CSS legado ya no se importa en la aplicación, por lo que SCSS es la única fuente de
estilos del Studio.

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
- `APPLY ENHANCEMENT` usa `apply_enhancement_bundle`: el MCP inspecciona, planifica, aplica y valida en una sola llamada. La UX ya no repite `inspect_reference` antes de pedir el plan.
- `QUALITY BUNDLE` ejecuta la inspección y quality gate compactos del MCP, muestra violaciones y recomendaciones sin generar archivos.
- `AUDIT COLLECTION` inspecciona el asset cargado y todas sus variantes con `inspect_asset_batch`, mostrando una matriz pass/review/failed sin repetir llamadas por archivo.
- `AUDIT ANIMATION` inspecciona frames, timing, deriva de paleta y costura de loop con `inspect_animation_quality` antes de exportar un GIF.
- `SPRITE NORMALIZATION` recorta bounds alfa compartidos, aplica padding y registra pivote por frame sin sobrescribir el origen.
- `BUILD ANIMATION SHEET` usa el ensamblador determinista del MCP para crear un PNG de frames y conservar delays/pivotes en un manifest JSON.
- `SPRITE HITBOXES` deriva hitboxes de colisión desde la geometría del MCP, permite modo por componentes o unión y muestra el manifest sin duplicar lógica en la UX.
- `SPRITE RUNTIME BUNDLE` empaqueta desde la UX el spritesheet, timing e hitboxes en una sola ejecución, mostrando el resultado y los logs del gateway.
- `SPRITE ANCHORS` genera puntos de placement por frame para evitar jitter al posicionar personajes, criaturas y props en escenas.
- `INSPECT SPRITE GEOMETRY` muestra bounds, componentes alfa, baseline drift y pivotes para detectar jitter antes de usar un sprite en una escena.
- Los paneles `MATERIAL ENHANCER` y `DEPTH LIGHTING` crean salidas separadas con seed, granularidad y luz direccional reproducibles.
- `PALETTE HARMONIZER` unifica la familia cromática de un PNG/GIF hacia un color de acento, limita la paleta y muestra swatches del resultado sin tocar el origen.
- `SPRITE EFFECTS` añade outline, color grade, sombra, partículas, normal map, lluvia, niebla atmosférica, ciclos de movimiento, nearest upscale, seamless texture, reflejo animado, caústicas de agua y ciclo día/atardecer/noche/amanecer con outputs separados.
- `REMOVE BACKGROUND` elimina de forma determinista el color conectado al borde, permite tolerancia RGB y conserva colores encerrados; el origen siempre queda intacto.
- `CLEAN ISOLATED PIXELS` corrige ruido de píxeles opacos aislados con vecinos mínimos e iteraciones acotadas, manteniendo los grupos conectados y el origen.
- `SPRITE GLOW` agrega aura radial para magia, fuego, lámparas y campanas mediante color, radio y opacidad reproducibles, sin modificar la silueta fuente.
- `SPRITE SILHOUETTE` genera una máscara monocromática para sombras, colisiones y previews mediante el mismo servicio MCP, conservando alpha, GIFs y el archivo original.
- `WIND SWAY` anima árboles, follaje, banderas y props colgantes con base estable, amplitud, semilla y dirección reproducibles mediante el mismo servicio MCP.
- `SPRITE SHADOW` genera sombras recortadas con color, desplazamiento X/Y y opacidad; el gateway envía el contrato MCP correcto y conserva GIFs animados.
- `RIM LIGHT` añade iluminación de borde cardinal o diagonal mediante el mismo servicio MCP, con color y fuerza deterministas, sin duplicar lógica en la UX.
- `AMBIENT OCCLUSION` añade sombreado de cavidades basado en vecindad alfa mediante el mismo servicio MCP, con radio, color y fuerza reproducibles.
- `SPECULAR HIGHLIGHT` añade una banda de brillo hacia el interior de la silueta para metal, agua, cristal y magia mediante el mismo servicio MCP, con dirección, radio y fuerza reproducibles.
- `COLOR RAMP` remapea la luminancia a sombras, medios tonos y brillos con una paleta determinista mediante el mismo servicio MCP, ideal para dar coherencia de estilo a sprites y escenarios.
- `MATERIAL GRAIN` aplica granularidad determinista por semilla, intensidad y escala para tierra, agua, piedra, follaje y superficies envejecidas mediante el mismo servicio MCP.
- `PIXEL DITHER` reduce bandas con dithering Bayer 4x4 entre dos colores de paleta, fuerza y escala reproducibles mediante el mismo servicio MCP.
- `COLOR TEMPERATURE` ajusta un asset hacia frío nocturno o cálido de atardecer/fuego con temperatura e intensidad deterministas mediante el mismo servicio MCP.
- `ENVIRONMENT VARIANT PACK` genera lluvia, fuego, terremoto, pájaros, noche, ciclos día/noche, walk, reflejos y caústicas desde un único asset, usando una sola llamada MCP y mostrando el manifiesto de artifacts.
- `ENHANCE COLLECTION` aplica cleanup, granularidad, oleaje, iluminación y partículas al asset y sus variantes en un batch único, con errores aislados y salidas separadas.
- `SCENE EFFECT STACK` agrupa materiales, iluminación, lluvia, niebla, viento, sombras, glow, partículas, reflejos/caústicas y ciclo día-noche en una sola llamada tipada a `generate_scene_effect_stack`; el orden de pasadas, la salida y los fallos quedan visibles en la UX.
- `BLEND BIOMES` calcula desde el panel de mapas una banda determinista de transición entre terrenos y crea un preview sin modificar el mapa fuente.
- `VARIANT PREVIEWS` muestra todas las salidas del pack en una galería horizontal reutilizable de Pixel UI, con links de preview y metadatos de frames/formato.
- `BUILD CONTACT SHEET` reúne las variantes del pack en una rejilla nearest-neighbor y enlaza su manifest JSON para inspección rápida con una sola llamada al MCP.
- `GENERATE SCENE` ejecuta el preset seleccionado desde la biblioteca mediante el nuevo gateway tipado `generate_asset_preset` y carga el preview resultante.
- `LIBRARY AUDIT` valida el catálogo compartido desde la UX mediante `audit_asset_library`, mostrando métricas de assets/carpetas y referencias rotas sin duplicar lógica del MCP.
- `LIBRARY MAP` carga `summarize_asset_library` y muestra categorías, ejemplos y presets en formato compacto para reducir consumo de contexto.
- `SCENE BUILDER` permite introducir IDs de assets y genera un plan visual de capas mediante `plan_asset_scene`, sin duplicar servicios del MCP ni producir archivos prematuramente.
- `RECIPE CREATOR` genera un plan MCP determinista con pasos seleccionables, material, luz y seed para revisión humana.
- `EXECUTE RECIPE` ejecuta el pipeline seleccionado en el servicio compartido del MCP, muestra cada paso, conserva el original y carga el artifact final en la comparación.
- `BACKGROUND ASSET JOB` permite presets PNG, animación, GIF y atlas; muestra progreso y artifacts con hash.
- `SCENE EXTENSION` amplía un mapa JSON existente con padding configurable, seed reproducible, preview y feedback de capas/landmarks preservados.
- Filtra herramientas y logs desde la UX. Atajos: `Ctrl+I` inspeccionar, `Ctrl+Enter` aplicar, `Ctrl+J` iniciar job.
- El panel de métricas ayuda a detectar latencia y fallos del gateway sin abrir logs del proveedor.

El Studio detecta Aseprite en la ruta configurada, en `ASEPRITE_PATH` y en rutas comunes. Al pulsar `START MCP` lanza el servidor por stdio, propaga `MCP_REST_PORT` y expone diagnósticos de runtime, detección y último error. Los endpoints REST del MCP permanecen en el repositorio MCP y reutilizan sus mismos servicios de dominio.
