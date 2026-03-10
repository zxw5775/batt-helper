# 电池小助手 / Batt Helper

电池小助手是一个构建在 `batt` 之上的 macOS 桌面电池管理工具，采用 Electron、React 和 TypeScript 实现。该项目使用 **OpenAI Codex（ChatGPT 5.4）** 开发，并进一步整理为可分发、可安装、适合日常使用的桌面应用。

> English documentation: see [README.md](README.md)

## 索引

- [项目介绍](#项目介绍)
- [界面截图](#界面截图)
- [Codex / ChatGPT 5.4 开发说明](#codex--chatgpt-54-开发说明)
- [核心功能](#核心功能)
- [运行要求](#运行要求)
- [安装方式](#安装方式)
- [首次启动流程](#首次启动流程)
- [开发与构建](#开发与构建)
- [项目结构](#项目结构)
- [架构说明](#架构说明)
- [batt 接入机制](#batt-接入机制)
- [多语言说明](#多语言说明)
- [版本产物](#版本产物)
- [文档索引](#文档索引)
- [License](#license)
- [致谢](#致谢)

## 项目介绍

电池小助手通过桌面图形界面包装 `batt` CLI 与 daemon，核心目标包括：

- 首次启动引导与环境检测
- batt Core 版本检测与更新引导
- 充电策略和快捷预设管理
- 电池健康与校准流程可视化
- 状态栏入口与 macOS 原生交互体验
- 完整中英文双语支持

本项目**没有把 batt 核心源码嵌入应用**，而是与系统中的外部 `batt` 二进制和 daemon 集成，通过检测、调用、修复和更新机制完成能力接入。

## 界面截图

### 深色仪表板

![电池小助手仪表板](<public/深色仪表板.png>)

### 深色充电界面

![电池小助手充电界面](<public/深色充电界面.png>)

### 浅色设置页

![电池小助手设置页](<public/浅色设置.png>)

## Codex / ChatGPT 5.4 开发说明

本仓库中的应用实现、桌面 UI 集成、打包流程、多语言接入，以及 batt 的桌面编排逻辑，均由 **OpenAI Codex（ChatGPT 5.4）** 完成开发与整理。

## 核心功能

- **首次引导**：检测平台支持、batt 可用性、daemon 状态、安装方式、最新版本
- **核心依赖管理**：支持安装 / 更新 / 修复，并在应用内展示明确进度
- **概览页**：展示电量、充电策略、功率流向、校准摘要
- **充电控制**：设置充电上限、下限回差、适配器模式与睡眠保护相关选项
- **电池健康**：展示健康度、循环次数、电压、交流输入、电池输出、系统总功率
- **校准能力**：支持阈值设置、满电停留时长、计划任务与手动控制
- **多语言**：应用内容、菜单、托盘文案均接入 i18n
- **外链安全**：项目中的外部链接统一通过系统浏览器打开，不在应用内部打开
- **macOS 打包**：支持生成 `.dmg` 与 `.zip` 安装产物

## 运行要求

### 运行环境

- macOS 11+
- 推荐 / 预期为 Apple Silicon 机型
- 若要真正控制电池策略，需要系统已安装 `batt`

### 开发环境

- Node.js 20+
- npm 10+
- macOS（用于完整打包验证）

## 安装方式

### 方式一：安装打包后的应用

1. 打开 `dist/` 目录下生成的 DMG
2. 将 `Batt Helper.app` 拖入 `/Applications`
3. 启动应用
4. 完成首次引导，并按提示检测 / 安装 batt 相关依赖

### 方式二：本地开发运行

```bash
npm install
npm run dev
```

## 首次启动流程

应用启动后会自动检查：

- 当前设备是否受支持
- 是否安装了 `batt`
- daemon 是否安装并运行
- 当前 batt 版本与上游最新版本
- 当前安装方式是 Homebrew、官方脚本安装还是手动安装

如果 batt 缺失、版本过旧或 daemon 异常，应用会给出安装、修复或更新入口。

## 开发与构建

### 启动开发模式

```bash
npm install
npm run dev
```

### 类型检查

```bash
npm run typecheck
```

### 生产构建

```bash
npm run build
```

### 打包发布产物

```bash
npm run dist
```

打包产物会生成到 `dist/` 目录。

## 项目结构

```text
src/
  main/        Electron 主进程、托盘、窗口、IPC、batt 桥接
  preload/     渲染进程安全桥接层
  renderer/    React 页面、组件、状态、语言包、样式
  shared/      共享类型与 IPC 协议
resources/
  brand/       应用运行时品牌资源
build/         应用图标打包资源
docs/          PRD 与技术设计文档
public/        README 截图与静态说明资源
```

## 架构说明

- Electron 主进程负责调用外部 `batt` 二进制与 daemon
- Renderer 通过 preload 暴露的 IPC 接口与主进程通信
- 主进程与渲染进程共享同一套多语言资源，用于菜单、托盘和页面文本
- 引导页、设置页、状态栏与 batt 检测模型统一联动

## batt 接入机制

电池小助手的大致接入流程如下：

1. 从常见安装路径定位 `batt`
2. 检查 batt 版本、安装方式和 daemon 状态
3. 执行 batt 命令并解析 JSON 输出
4. 将 batt 状态映射到桌面 UI
5. 根据安装方式执行更新或修复流程

这样可以保持桌面应用本身轻量，同时继续沿用 batt 官方推荐的安装和升级路径。

## 多语言说明

当前支持：

- English
- 简体中文

语言资源位于：

- [`src/renderer/locales/en-US.json`](src/renderer/locales/en-US.json)
- [`src/renderer/locales/zh-CN.json`](src/renderer/locales/zh-CN.json)

## 版本产物

当前发布产物：

- `dist/Batt Helper-0.1.1-arm64.dmg`
- `dist/Batt Helper-0.1.1-arm64.zip`

版本说明记录在：

- [`CHANGELOG.md`](CHANGELOG.md)

## 文档索引

项目相关文档与文件入口：

- [English README](README.md)
- [产品需求文档](docs/PRD.md)
- [技术设计文档](docs/TECHNICAL_DESIGN.md)
- [变更记录](CHANGELOG.md)
- [许可证](LICENSE)
- [包清单](package.json)
- [Electron Builder 配置](electron-builder.yml)

## License

本项目采用 MIT License，详见 [LICENSE](LICENSE)。

## 致谢

- 桌面应用实现：`zxw5775 | gpt5.4`
- 电池控制核心引擎：[`batt`](https://github.com/charlie0129/batt)
