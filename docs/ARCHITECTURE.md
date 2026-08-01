# Arquitectura

Asset Studio separa la UX del control de procesos:

```text
React UX → casos de uso → puertos → adaptadores Node/MCP/filesystem
```

El navegador no conoce `child_process`, MCP SDK ni rutas de Aseprite. El proceso gateway compone adaptadores concretos y expone controladores HTTP locales.

## Mejoras previstas y entregadas

1. `ServerSetupService` inicia y detiene sesiones mediante un puerto genérico;
2. `JsonStudioConfigStore` y `LocalAssetStore` son persistencias reemplazables;
3. `StudioHttpController` es delgado y solo traduce HTTP;
4. el upload de assets pasa por un puerto y valida tamaño/formato;
5. jobs de assets, preview, recetas y comparación visual quedan como siguientes slices;
6. pruebas de contrato, E2E y accesibilidad acompañan cada extracción.
