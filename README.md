# Letter – Formal Letter Composer

A web application for composing formal administrative letters on A4 canvas with rich formatting, templates, and PDF export.

## Features
- Two customizable rectangles (header and body) on A4 canvas.
- Drag, resize, and style rectangles (fill, border, radius).
- Rich text editor for body with formatting toolbar.
- Header fields: organization, logo, date, attachment, letter number.
- 5 built-in templates; save/load/export/import custom templates.
- Export to high-quality PDF using html2canvas + jsPDF.
- Undo/Redo, zoom, autosave, light/dark themes, English/Persian (RTL).
- All data stored in localStorage.

## How to Run
1. Clone or download this repository.
2. Open `index.html` in a modern browser (Chrome/Firefox/Edge).
   - *Important:* Because the app uses ES6 modules, you must run it from a local server, not directly as `file://`. You can use any static server, e.g., `npx serve .` or Python's `python -m http.server`.
3. The app loads with default templates. Start composing.

## Usage
- **Canvas**: Drag rectangles to move, use handles to resize. Click to select.
- **Properties Panel**: Adjust rectangle properties and header fields.
- **Editor**: Click inside body rectangle to edit text. Formatting toolbar appears.
- **Templates**: Select a template from dropdown, or save current as template, export/import JSON.
- **PDF Export**: Click "Export PDF" button; enter filename.
- **Theme/Language**: Use top bar buttons.

## Offline Use
The app uses CDN links for libraries (Font Awesome, Quill, html2canvas, jsPDF). To use offline, download those libraries and update the `<link>` and `<script>` tags in `index.html`.

## Unit Tests
To run unit tests, install dependencies and run Jest:
