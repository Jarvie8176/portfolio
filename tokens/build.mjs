// Design-token build: tokens/penpot.json (serialized from the Penpot
// `portfolio` token set) + tokens/aliases.json (repo-side aliases) ->
// src/styles/tokens.generated.css. Run `npm run tokens:build` after
// re-serializing from Penpot; the output is committed so the site build
// needs no extra step.
import StyleDictionary from 'style-dictionary';

const VAR_NAMES = {
  'color.paper': 'paper', 'color.surface': 'surface', 'color.surface-quiet': 'surface-quiet',
  'color.ink': 'ink', 'color.ink-soft': 'ink-soft', 'color.ink-faint': 'ink-faint',
  'color.rule': 'rule', 'color.rule-hard': 'rule-hard',
  'color.systems': 'systems', 'color.embodied': 'embodied', 'color.worlds': 'worlds',
  'color.thesis-claim': 'thesis-claim', 'color.thesis-body': 'thesis-body',
  'color.dark-ground': 'dark-ground', 'color.dark-ink': 'dark-ink', 'color.dark-line': 'dark-line',
  'color.paper-2': 'paper-2', 'color.paper-3': 'paper-3', 'color.line': 'line',
  'color.line-hard': 'line-hard', 'color.stamp': 'stamp', 'color.accent': 'accent',
  'color.live': 'live', 'color.open': 'open',
  'font.sans': 'sans', 'font.serif': 'serif', 'font.mono': 'mono',
  'fs.label': 'fs-label', 'fs.meta': 'fs-meta', 'fs.body': 'fs-body',
  'fs.h3': 'fs-h3', 'fs.h2': 'fs-h2',
  'track.label': 'track-label',
  'sp.1': 'sp-1', 'sp.2': 'sp-2', 'sp.3': 'sp-3', 'sp.4': 'sp-4', 'sp.5': 'sp-5',
  'col.main': 'col-main', 'col.note': 'col-note',
  'size.header-min': 'site-header-min',
  'radius.default': 'radius',
};

StyleDictionary.registerTransform({
  name: 'name/portfolio-var',
  type: 'name',
  transform: (token) => {
    const path = token.path.join('.');
    if (!(path in VAR_NAMES)) throw new Error(`no CSS variable mapping for token '${path}'`);
    return VAR_NAMES[path];
  },
});

const sd = new StyleDictionary({
  source: ['tokens/penpot.json', 'tokens/aliases.json'],
  platforms: {
    css: {
      transforms: ['name/portfolio-var'],
      buildPath: 'src/styles/',
      files: [{
        destination: 'tokens.generated.css',
        format: 'css/variables',
        options: { outputReferences: true, fileHeader: () => [
          'GENERATED from tokens/penpot.json + tokens/aliases.json via `npm run tokens:build`.',
          'Source of truth: Penpot `portfolio` token set. Do not edit by hand.',
        ] },
      }],
    },
  },
});
await sd.buildAllPlatforms();
