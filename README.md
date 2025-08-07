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

## Pinia stores

The following stores deal with managing user settings and data collection:

- `useOverlaySettingsStore` holds general overlay settings that are not specific to one game or pokemon species.
- `useGameSpeciesData` holds overlay settings relating to a game and pokemon species in that game. 
- `useSpeciesMetricsStore` holds game and species specific metrics, such as number of resets, time played and so on.
  It also is responsible for managing the `Timer`. 
- `useBattleStore` collects statistics about trainer battles, such as length of battle, experience gained, turns used, ...
- `useMetaStore` provides some general purpose high level information, such as the current starter, game state, enemy state
  and current species.
- `useSettingsStore` exists to manage the other stores, such as loading and saving their settings and ensuring that species
  selection is communicated accross all relevant stores.

