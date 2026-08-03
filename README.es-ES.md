# Batt Helper

Batt Helper es una aplicación de escritorio moderna para la gestión de batería de macOS, construida sobre `batt`, implementada con Electron, React y TypeScript. Este proyecto fue desarrollado con OpenAI Codex impulsado por ChatGPT 5.4, y luego refinado en un producto de escritorio distribuible para el uso diario en Macs Apple Silicon.

> Documentación en chino: consulta [README.zh-CN.md](README.zh-CN.md)

## Índice

- [Descripción general](#overview)
- [Capturas de pantalla](#screenshots)
- [Construido con Codex / ChatGPT 5.4](#built-with-codex--chatgpt-54)
- [Características clave](#key-features)
- [Requisitos](#requirements)
- [Instalación](#installation)
- [Flujo de primera ejecución](#first-launch-flow)
- [Flujo de desarrollo](#development-workflow)
- [Estructura del proyecto](#project-structure)
- [Notas de arquitectura](#architecture-notes)
- [Modelo de integración de batt](#batt-integration-model)
- [Localización](#localization)
- [Archivos de release](#release-files)
- [Índice de documentación](#documentation-index)
- [Licencia](#license)
- [Créditos](#credits)

## Descripción general

Batt Helper envuelve la CLI y el daemon de `batt` con una interfaz de escritorio centrada en:

- onboarding y detección del entorno
- detección y actualización de la versión del núcleo batt
- control de estrategias de carga y ajustes rápidos
- flujos de trabajo de salud y calibración de batería
- acceso a la barra de menús y comportamientos nativos de macOS
- soporte de interfaz bilingüe (Inglés / Chino Simplificado)

Este proyecto **no** incrusta el código fuente del núcleo batt. En su lugar, integra con el binario y daemon externo `batt`, detecta su disponibilidad y versión, y ayuda al usuario a instalar, reparar o actualizar estos componentes a través de la aplicación.

## Capturas de pantalla

### Panel de control (Oscuro)

![Batt Helper Dashboard](<public/深色仪表板.png>)

### Carga (Oscuro)

![Batt Helper Charging](<public/深色充电界面.png>)

### Configuración (Claro)

![Batt Helper Settings](<public/浅色设置.png>)

## Construido con Codex / ChatGPT 5.4

La implementación de la aplicación, integración de UI, flujo de empaquetado, enlace de localización y orquestación de escritorio de batt en este repositorio fueron desarrollados con **OpenAI Codex usando ChatGPT 5.4**.

## Características clave

- **Onboarding de primera ejecución**: detecta soporte de plataforma, disponibilidad de batt, estado del daemon, método de instalación y disponibilidad de la última versión de release
- **Gestión de dependencias del núcleo**: soporta flujos de instalación / actualización / reparación con progreso visible dentro de la aplicación
- **Panel de control**: muestra carga actual, estrategia de carga, flujo de energía y resumen de calibración
- **Controles de carga**: establecer límite superior de carga, delta límite inferior, comportamiento del adaptador y políticas relacionadas con el sueño
- **Salud de la batería**: expone telemetría como salud, ciclos, voltaje, energía de CA, energía de batería y energía del sistema
- **Herramientas de calibración**: configurar umbrales, duración de retención, programaciones basadas en cron y controles manuales
- **Localización**: todo el contenido visible en la aplicación pasa por recursos de i18n
- **Seguridad de enlaces externos**: los enlaces externos se abren en el navegador del sistema en lugar de dentro de la ventana de la aplicación
- **Empaquetado de macOS**: genera artefactos `.dmg` y `.zip` para distribución

## Requisitos

### Tiempo de ejecución

- macOS 11+
- Mac Apple Silicon recomendado / esperado para funcionalidad completa de batt
- `batt` instalado localmente para habilitar las funciones reales de control de batería

### Desarrollo

- Node.js 20+
- npm 10+
- Entorno macOS para validación completa del empaquetado

## Instalación

### Opción 1: Instalar desde release empaquetado

1. Abrir el DMG generado en `dist/`
2. Arrastrar `Batt Helper.app` a `/Applications`
3. Lanzar la aplicación
4. Completar el onboarding y permitir que la aplicación detecte o instale componentes relacionados con batt

### Opción 2: Ejecutar en modo desarrollo

```bash
npm install
npm run dev
```

## Flujo de primera ejecución

Al primera ejecución, Batt Helper verifica:

- si el dispositivo está soportado
- si `batt` está instalado
- si el daemon está disponible y en ejecución
- la versión instalada de batt y la última release upstream
- si la instalación parece provenir de Homebrew, instalación por script o configuración manual

Si batt falta o está obsoleto, la aplicación puede guiar al usuario a través de flujos de instalación, reparación o actualización.

## Flujo de desarrollo

### Iniciar desarrollo

```bash
npm install
npm run dev
```

### Verificar tipos

```bash
npm run typecheck
```

### Construcción de producción

```bash
npm run build
```

### Generar artefactos de release

```bash
npm run dist
```

Los artefactos se generan en `dist/`.

## Estructura del proyecto

```text
src/
  main/        Proceso principal de Electron, bandeja, ventana, IPC, puente batt
  preload/     Puente seguro exponiendo al renderer
  renderer/    UI de React, páginas, componentes, stores, locales, estilos
  shared/      Tipos compartidos y contratos IPC
resources/
  brand/       Activos de marca en tiempo de ejecución usados por la aplicación empaquetada
build/         Recursos de icono de aplicación empaquetados
docs/          Referencias de PRD y diseño técnico
public/        Capturas de pantalla del README y activos documentales estáticos
```

## Notas de arquitectura

- El proceso principal de Electron se comunica con el binario y daemon externo `batt`
- El renderer se comunica a través de APIs IPC del preload
- La localización se comparte entre el menú/tray nativo del proceso main y las etiquetas del renderer
- La bandeja, el menú, el onboarding y la configuración están coordinadas alrededor del mismo modelo de diagnósticos de batt

## Modelo de integración de batt

Batt Helper utiliza el siguiente enfoque:

1. localizar el binario `batt` desde rutas de instalación comunes
2. inspeccionar diagnósticos e información de versión de batt
3. llamar a comandos de batt y analizar respuestas JSON
4. superficial el estado de batt en la UI de escritorio
5. reparar o actualizar batt usando el método de instalación detectado

Esto mantiene la aplicación de escritorio ligera mientras permanece alineada con las rutas de instalación y actualización upstream de batt.

## Localización

Idiomas soportados:

- Inglés
- Chino Simplificado

Los recursos localizados por defecto viven en:

- [`src/renderer/locales/en-US.json`](src/renderer/locales/en-US.json)
- [`src/renderer/locales/zh-CN.json`](src/renderer/locales/zh-CN.json)

## Archivos de release

Salidas empaquetadas actuales:

- `dist/Batt Helper-0.1.1-arm64.dmg`
- `dist/Batt Helper-0.1.1-arm64.zip`

Las notas actuales de release están rastreadas en:

- [`CHANGELOG.md`](CHANGELOG.md)

## Índice de documentación

Referencias del proyecto y archivos relacionados:

- [README en chino](README.zh-CN.md)
- [Requisitos del producto](docs/PRD.md)
- [Diseño técnico](docs/TECHNICAL_DESIGN.md)
- [Changelog](CHANGELOG.md)
- [Licencia](LICENSE)
- [Manifiesto del paquete](package.json)
- [Configuración de Electron Builder](electron-builder.yml)

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver [LICENSE](LICENSE).

## Créditos

- Implementación de la aplicación de escritorio: `zxw5775 | gpt5.4`
- Motor de control de batería del núcleo: [`batt`](https://github.com/charlie0129/batt)
