# Arquitectura

Asset Studio separa la UX del control de procesos:

```text
React UX → casos de uso → puertos → adaptadores Node/MCP/filesystem
```

El navegador no conoce `child_process`, MCP SDK ni rutas de Aseprite. El proceso gateway compone adaptadores concretos y expone controladores HTTP locales.

## Mejoras entregadas

1. `ServerSetupService` inicia y detiene sesiones mediante un puerto genérico;
2. `JsonStudioConfigStore` y `LocalAssetStore` son persistencias reemplazables;
3. `StudioHttpController` es delgado y solo traduce HTTP;
4. el upload de assets pasa por un puerto y valida tamaño/formato;
5. `ToolResponseParser` centraliza la lectura de respuestas de herramientas, preserva `isError` y diagnostica JSON inválido;
6. `QualityGatePanel` muestra resultado y violaciones con una primitive reusable, sin reglas de dominio en React;
7. `AssetJobService` traduce recetas genéricas al contrato externo, mientras la UX solo consume estados tipados;
8. `useAssetJobController` aísla polling, cancelación y selección de receta del controlador principal;
9. `AssetArtifactView` conserva metadata genérica de outputs y `AssetJobPanel` muestra formato, tamaño y hash abreviado;
10. las pruebas TDD cubren los casos de uso de mejora, jobs, artifacts, HTTP y límites de almacenamiento.

## Plan de implementación

### Fase 3 · Jobs y artifacts — implementada

- definir puertos genéricos para `JobRepository`, `ArtifactRepository` y reloj;
- implementar persistencia local como adaptador reemplazable, con estados `queued`, `running`, `completed`, `failed` y `cancelled`;
- exponer operaciones de inicio, consulta y cancelación mediante el controlador HTTP genérico de herramientas;
- conservar el input y el output separados, con checksum y metadatos de receta;
- mostrar los artifacts generados en la UX sin exponer detalles del proveedor;
- probar primero las transiciones de estado y después el flujo contra el gateway real.

### Fase 4 · UX de producción

- añadir comparación antes/después, selector de receta y navegación de frames;
- mostrar señales detectadas, warnings y quality gate sin mezclar reglas de dominio en React;
- usar componentes de `pixel-art-ui` para estados accesibles, teclado y reduced motion;
- añadir pruebas de interacción y un E2E del flujo upload → inspect → plan → apply.

### Fase 5 · Contratos y releases

- versionar un contrato JSON de planes y resultados;
- generar fixtures compactos para agentes y evitar repetir contexto grande;
- validar compatibilidad MCP/Studio en CI;
- publicar la librería UI desde un workflow protegido por `NPM_TOKEN`.
