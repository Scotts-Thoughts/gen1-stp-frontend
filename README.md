# How to develop

1. `npm ci`
2. `npm run dev`

The overlay should then open. You can make changes in the code and it will automatically apply to the running application.

## Code structure

The source is split into 3 parts due to how electron applications work with vite (vite is the build system used).

- `src/main`  contains the main electron process logic, which among other things is responsible for creating the browser window.
- `src/preload` is for setting up communication between the main process and the "renderer" process.
- `src/renderer` contains the UI code and all of the overlay logic.

Within `src/renderer`:

- `autosplitter`  For autosplitter code and data.
- `components`  contains the various vue components used to render the overlay.
- `data` contains static data files (such as pokedex data or move information).
- `logic` is for general purpose functions that are not specific to any one store or sub-system.
- `methods`: obsolete*
- `packages`: for external dependencies that have been pulled into the codebase.
- `public`: For assets used in the UI. All the images go here.
- `settings`: obsolete*
- `stores`: For pinia stores. Stores allow data storage and manipulation accross component boundaries.
- `utils`: For small utility functions such as formatting and simple calculations.

\*: Some more work is needed before they can be deleted.