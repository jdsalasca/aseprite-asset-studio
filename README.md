# Aseprite Asset Studio

Interfaz Vite + React + TypeScript para operar `aseprite-asset-mcp` con una guía de configuración humana. Los componentes visuales provienen del repositorio independiente [`@jdsalas/pixel-ui`](../pixel-art-ui).

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
```
