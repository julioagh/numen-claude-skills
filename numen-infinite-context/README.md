# numen-infinite-context

Plugin para Claude Code que preserva el contexto de sesiones largas guardando memorias localmente antes de cada compactación y restaurándolas al inicio de la siguiente sesión.

## Basado en

Este plugin toma como referencia de diseño [Elizarfish/infinite-context](https://github.com/Elizarfish/infinite-context), un plugin open source que implementa el mismo patrón de archivado de contexto vía hooks de ciclo de vida de Claude Code.

### Qué se limitó respecto al original

| Componente original | Decisión | Razón |
|---|---|---|
| Dashboard web (puerto 3333) | Eliminado | Servidor HTTP local sin autenticación — cualquier proceso con acceso a localhost podía leer, modificar o eliminar memorias |
| Modo de extracción LLM | Eliminado | Realiza llamadas a la API de Anthropic en cada sesión, exponiendo el historial de conversación a un servicio externo |
| Modo híbrido (regex + LLM) | Eliminado | Mismo riesgo que el modo LLM |

Solo se conservó el modo de extracción por **regex**, que opera completamente offline.

## Qué hace

- Intercepta el evento `PreCompact` para archivar memorias antes de que Claude Code comprima la conversación
- Al iniciar sesión (`SessionStart`) restaura las memorias más relevantes del proyecto
- En cada mensaje (`UserPromptSubmit`) inyecta contexto relacionado por búsqueda de keywords (máx. 1 vez/minuto)
- Al cerrar sesión (`Stop`) hace una pasada final del transcript
- Soporta subagentes: comparte contexto del proyecto con agentes hijo

## Almacenamiento

Todo local. Sin red. Sin telemetría.

```
~/.claude/secure-infinite-context/memory.db   ← SQLite con FTS5
~/.claude/secure-infinite-context/config.json ← configuración opcional
```

Los datos sensibles (API keys, tokens, passwords) se redactan automáticamente antes de almacenarse.

## Instalación

```bash
cd numen-infinite-context
npm install
node src/cli.js install
# Reiniciar Claude Code
```

## Comandos

```bash
node src/cli.js list                        # listar memorias del proyecto actual
node src/cli.js search "arquitectura"       # buscar por keyword
node src/cli.js stats                       # estadísticas por proyecto
node src/cli.js prune                       # eliminar memorias con score bajo
node src/cli.js delete <id>                 # eliminar memoria específica
node src/cli.js uninstall                   # desinstalar hooks
```

## Requisitos

- Node.js >= 20
- Claude Code con soporte de hooks
