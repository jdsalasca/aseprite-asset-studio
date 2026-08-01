# Arquitectura

Asset Studio separa la UX del control de procesos:

```text
React UX → casos de uso → puertos → adaptadores Node/MCP/filesystem
```

El navegador no conoce `child_process`, MCP SDK ni rutas de Aseprite. El proceso gateway compone adaptadores concretos y expone controladores HTTP locales.

## Mejoras previstas

1. `ServerSetupService` para iniciar y detener sesiones mediante un puerto genérico;
2. `JsonStudioConfigStore` como persistencia reemplazable;
3. controlador HTTP delgado;
4. jobs de assets y preview mediante puertos;
5. pruebas de contrato, E2E y accesibilidad.
