[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

# Verovio Editor

A customizable, web-based musical score editor built on [Verovio](https://www.verovio.org/).

This repository provides an interactive prototype and a reusable library for rendering, editing, and interacting with MEI and MusicXML scores directly in the browser. It leverages Verovio for high-quality SVG rendering and provides a customizable UI for score manipulation, MIDI playback, and more.

## Features
- **Score Rendering:** High-quality SVG rendering using Verovio.
- **Interactive Editing:** Edit scores directly in the browser.
- **Format Support:** Supports MEI and MusicXML.
- **MIDI Playback:** Integrated MIDI playback using modern web audio APIs.
- **Customizable Library:** Use it as an importable library to build your own score-editing applications.

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- `pnpm` (preferred package manager)

### Installation

Install dependencies:

```bash
pnpm install
```

### Development
Start the local development server:
```bash
pnpm run dev
```

Build the library for production:
```bash
pnpm run build
```

## Usage

You can use the editor by initializing the `App` class. The library is designed to be customizable and extensible.

### Basic Initialization

```javascript
import { App } from 'verovio-editor';
import 'verovio-editor/css/verovio.css'; // Import styles

const options = {
    defaultView: 'editor',
    baseUrl: 'https://your-server.com/assets', // Path to icons and scripts
};

const app = new App(document.getElementById("app"), options);

// Load an MEI file
app.loadData(meiString, 'filename.mei');
```

### Customization Options

The `App.Options` interface allows you to configure various aspects of the editor:

| Option | Type | Description |
| --- | --- | --- |
| `baseUrl` | `string` | Base URL for fetching icons, SVG filters, and default CSS. |
| `enableToolbar` | `boolean` | Show/hide the main application toolbar. |
| `enableStatusbar` | `boolean` | Show/hide the bottom status bar. |
| `enableMidiToolbar`| `boolean` | Show/hide the MIDI playback controls. |
| `enableContextMenu`| `boolean` | Enable/disable the right-click context menu. |
| `disableLocalStorage`| `boolean`| Disable automatic state persistence to browser storage. |
| `storageProvider` | `StorageProvider` | Custom implementation for state persistence (see below). |
| `verovioUrl` | `string` | Custom URL for the Verovio WebAssembly script. |

### Event Handling

The library provides a public event API to react to application state changes:

```javascript
app.on('onLoadData', (event) => {
    console.log('File loaded:', event.detail.mei);
});

app.on('onSelect', (event) => {
    console.log('Element selected:', event.detail.id);
});
```

Available events include: `onActivate`, `onDeactivate`, `onLoadData`, `onSelect`, `onEditData`, `onResized`, `onPage`, `onZoom`, `onStartLoading`, `onEndLoading`.

### Custom Storage Provider

By default, the editor saves its state (options, recent files) to `localStorage`. You can provide a custom implementation of the `StorageProvider` interface:

```javascript
const myStorage = {
    getItem(key) { /* return value */ },
    setItem(key, value) { /* store value */ },
    removeItem(key) { /* remove value */ }
};

const app = new App(container, { storageProvider: myStorage });
```

## License

This project is licensed under the AGPL v3 License - see the LICENSE file for details.
