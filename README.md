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

You can use the editor by initializing the `App` class:

```javascript
import { App } from 'verovio-editor';

const options = {
    documentViewSVG: false,
    enableDocument: true,
    enableResponsive: true,
    enableEditor: true,
    defaultView: 'editor',
    enableValidation: true
};

const app = new App(document.getElementById("app"), options);

// Load an MEI file
fetch('path/to/your/file.mei')
    .then(response => response.text())
    .then(text => {
        app.loadData(text, 'file.mei', false, true);
    });
```

## License

This project is licensed under the AGPL v3 License - see the LICENSE file for details.
