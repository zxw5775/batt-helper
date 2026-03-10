# Batt Helper

Batt Helper is a modern macOS battery management desktop app built on top of `batt`, implemented with Electron, React, and TypeScript. This project was developed with OpenAI Codex powered by ChatGPT 5.4, then refined into a distributable desktop product for daily Apple Silicon Mac usage.

> Chinese documentation: see [README.zh-CN.md](README.zh-CN.md)

## Index

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Built With Codex / ChatGPT 5.4](#built-with-codex--chatgpt-54)
- [Key Features](#key-features)
- [Requirements](#requirements)
- [Installation](#installation)
- [First Launch Flow](#first-launch-flow)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
- [batt Integration Model](#batt-integration-model)
- [Localization](#localization)
- [Release Files](#release-files)
- [Documentation Index](#documentation-index)
- [License](#license)
- [Credits](#credits)

## Overview

Batt Helper wraps the `batt` CLI and daemon with a desktop UI focused on:

- onboarding and environment detection
- batt core version detection and update guidance
- charging strategy control and quick presets
- battery health and calibration workflows
- menu bar access and macOS-native behaviors
- bilingual interface support (English / Simplified Chinese)

This project does **not** embed the batt core source code. Instead, it integrates with the external `batt` binary and daemon, detects their availability and version, and helps the user install, repair, or update them through the app.

## Screenshots

### Dashboard (Dark)

![Batt Helper Dashboard](<public/深色仪表板.png>)

### Charging (Dark)

![Batt Helper Charging](<public/深色充电界面.png>)

### Settings (Light)

![Batt Helper Settings](<public/浅色设置.png>)

## Built With Codex / ChatGPT 5.4

The application implementation, UI integration, packaging flow, localization wiring, and batt desktop orchestration in this repository were developed with **OpenAI Codex using ChatGPT 5.4**.

## Key Features

- **First-launch onboarding**: detects platform support, batt availability, daemon status, install method, and latest release availability
- **Core dependency management**: supports install / update / repair flows with visible in-app progress
- **Dashboard**: shows current charge, charge strategy, power flow, and calibration summary
- **Charging controls**: set upper charge limit, lower limit delta, adapter behavior, and sleep-related policies
- **Battery health**: surfaces telemetry such as health, cycles, voltage, AC power, battery power, and system power
- **Calibration tools**: configure thresholds, hold duration, cron-based schedules, and manual controls
- **Localization**: all app-facing content is wired through i18n resources
- **External link safety**: external links are opened in the system browser instead of inside the app window
- **macOS packaging**: generates `.dmg` and `.zip` artifacts for distribution

## Requirements

### Runtime

- macOS 11+
- Apple Silicon Mac recommended / expected for full batt functionality
- `batt` installed locally to enable actual battery control features

### Development

- Node.js 20+
- npm 10+
- macOS environment for full packaging validation

## Installation

### Option 1: Install from packaged release

1. Open the generated DMG in `dist/`
2. Drag `Batt Helper.app` into `/Applications`
3. Launch the app
4. Complete onboarding and allow the app to detect or install batt-related components

### Option 2: Run in development mode

```bash
npm install
npm run dev
```

## First Launch Flow

On first launch, Batt Helper checks:

- whether the device is supported
- whether `batt` is installed
- whether the daemon is available and running
- the installed batt version and latest upstream release
- whether the installation appears to come from Homebrew, script install, or manual setup

If batt is missing or outdated, the app can guide the user through installation, repair, or upgrade workflows.

## Development Workflow

### Start development

```bash
npm install
npm run dev
```

### Type-check

```bash
npm run typecheck
```

### Production build

```bash
npm run build
```

### Package release artifacts

```bash
npm run dist
```

Artifacts are generated in `dist/`.

## Project Structure

```text
src/
  main/        Electron main process, tray, window, IPC, batt bridge
  preload/     Secure bridge exposed to renderer
  renderer/    React UI, pages, components, stores, locales, styles
  shared/      Shared types and IPC contracts
resources/
  brand/       Runtime brand assets used by the packaged app
build/         Packaged app icon resources
docs/          PRD and technical design references
public/        README screenshots and static documentation assets
```

## Architecture Notes

- The Electron main process talks to the external `batt` binary and daemon
- The renderer communicates through preload IPC APIs
- Localization is shared between renderer and main-process native menu / tray labels
- Tray, menu, onboarding, and settings are coordinated around the same batt diagnostics model

## batt Integration Model

Batt Helper uses the following approach:

1. locate the `batt` binary from common install paths
2. inspect batt diagnostics and version information
3. call batt commands and parse JSON responses
4. surface batt state in the desktop UI
5. repair or upgrade batt using the detected install method

This keeps the desktop app lightweight while remaining aligned with upstream batt installation and update paths.

## Localization

Supported languages:

- English
- Simplified Chinese

Default localized resources live in:

- [`src/renderer/locales/en-US.json`](src/renderer/locales/en-US.json)
- [`src/renderer/locales/zh-CN.json`](src/renderer/locales/zh-CN.json)

## Release Files

Current packaged outputs:

- `dist/Batt Helper-0.1.1-arm64.dmg`
- `dist/Batt Helper-0.1.1-arm64.zip`

Current release notes are tracked in:

- [`CHANGELOG.md`](CHANGELOG.md)

## Documentation Index

Project references and related files:

- [Chinese README](README.zh-CN.md)
- [Product Requirements](docs/PRD.md)
- [Technical Design](docs/TECHNICAL_DESIGN.md)
- [Changelog](CHANGELOG.md)
- [License](LICENSE)
- [Package Manifest](package.json)
- [Electron Builder Config](electron-builder.yml)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

## Credits

- Desktop app implementation: `zxw5775 | gpt5.4`
- Core battery control engine: [`batt`](https://github.com/charlie0129/batt)
