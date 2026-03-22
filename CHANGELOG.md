# [Unreleased]
* **Library Customization Features**:
    - Externalized hardcoded URLs and configuration into `App.Options` (`baseUrl`, Worker URLs, GitHub Client ID, etc.).
    - Implemented a flexible storage abstraction layer (`StorageProvider`) to allow custom state persistence.
    - Decoupled UI components (Toolbar, Statusbar, ContextMenu) making them optional via configuration flags.
    - Refactored `MidiPlayer` to be independent of specific UI components.
    - Introduced a public Event API on the `App` class for easier integration with host applications.
* **Documentation Enhancement**: Rewrote `README.md` in English to provide comprehensive information on features, installation, and library usage guides.
* **Modern Development Environment**:
    - Integrated NPM (`pnpm`) for dependency management.
    - Added Vite for optimized local development and efficient library bundling.
    - Set up TypeScript configuration for ESM compatibility and automated type generation.
    - Configured ESLint and Prettier to ensure code quality and consistent formatting.
* **Library Refactoring**:
    - Established a central library entry point in `ts/index.ts`.
    - Configured build pipelines for UMD and ESM library formats.
    - Updated `package.json` to support direct integration as an NPM dependency.
    - Improved static asset (CSS, icons, SVG) management for better distribution.

# 1.5.0
* Fix MIDI playback to use expansion map
* Code refactoring

# 1.4.5
* Fix editor overlay

# 1.4.4
* Add CMME input menu

# 1.4.3
* Use local version for some external packages

# 1.4.2
* Hide the settings menu in the Verovio App

# 1.4.1
* Fix MIDI player not loaded in the Verovio App

# 1.4.0
* Toggle XML editor
* Disable live validation and refreshing for files larger than 0.5 MB

# 1.3.0
* Change MIDI player to [html-midi-player](https://cifkao.github.io/html-midi-player/)
* Changelog