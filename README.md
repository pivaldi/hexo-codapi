![CI](https://github.com/pivaldi/hexo-codapi/actions/workflows/ci.yml/badge.svg)
![npm](https://img.shields.io/npm/v/hexo-codapi)
![downloads](https://img.shields.io/npm/dm/hexo-codapi)
![license](https://img.shields.io/npm/l/hexo-codapi)

# Hexo Codapi Plugin

Embed **live, executable code snippets** in your Hexo blog using
[Codapi](https://codapi.org).

This plugin provides:

- A `{% codapi %}` **tag plugin** for author-friendly usage in Markdown
- **Automatic, per-page injection** of Codapi JS/CSS (only on pages that need it)
- Theme-agnostic integration (no theme edits required)

---

## Features

- Clean author syntax (`{% codapi %}`)
- Outputs Codapi-compatible HTML (`<pre>` + `<codapi-snippet>`)
- Injects assets **only on pages containing Codapi snippets**
- Configurable defaults and CDN URLs
- Works with any Hexo theme

---

## Installation

```bash
npm install hexo-codapi
```

### Hexo 8.x Users (Required)

If you're using Hexo 8.0 or later, you need to explicitly load the plugin. Create a file `scripts/load-codapi.js` in your Hexo blog directory:

```javascript
// scripts/load-codapi.js
const plugin = require('hexo-codapi');
plugin(hexo);
```

This is due to a change in Hexo 8.x's plugin loading mechanism.

### Hexo 5.x - 7.x Users

For older Hexo versions, the plugin loads automatically - no additional setup needed.

Then rebuild:

```bash
hexo clean && hexo generate
```

---

## Usage

In any post or page:

```text
{% codapi go basic %}
println("Hello, Codapi!")
{% endcodapi %}
```

This renders an executable Go snippet powered by Codapi.

---

## Syntax

```text
{% codapi <sandbox> <editor> [engine=...] [selector=...] %}
<code>
{% endcodapi %}
```

### Parameters

| Parameter  | Description                                | Default |
| ---------- | ------------------------------------------ | ------- |
| `sandbox`  | Codapi sandbox (e.g. `go`, `js`, `bash`)  | `go`    |
| `editor`   | Editor UI (`basic`, `full`)                | `basic` |
| `engine`   | Optional execution engine                  | *(none)* |
| `selector` | Attach Codapi to an existing element       | *(none)* |

### Examples

Basic Go:

```text
{% codapi go %}
println("Hello World")
{% endcodapi %}
```

JavaScript with browser engine:

```text
{% codapi js basic engine=browser %}
console.log("Hello from the browser")
{% endcodapi %}
```

---

## Configuration

Add to your Hexo `_config.yml`:

```yml
codapi:
  version: 0.20.0
  default_sandbox: go
  default_editor: basic
```

### Optional overrides

```yml
codapi:
  js: https://unpkg.com/@antonz/codapi@0.20.0/dist/snippet.js
  css: https://unpkg.com/@antonz/codapi@0.20.0/dist/snippet.css
  priority: 10
```

| Option       | Description                                |
| ------------ | ------------------------------------------ |
| `version`    | Codapi package version (used for CDN URLs) |
| `js` / `css` | Override CDN URLs                          |
| `priority`   | Hexo filter priority (`after_render:html`) |

### Self-hosting Codapi assets

To self-host `snippet.js` and `snippet.css` instead of using the CDN:

1. **Download the assets** from the [Codapi releases](https://github.com/nalgeon/codapi/releases) or unpkg:
   ```bash
   # Create assets directory in your Hexo source
   mkdir -p source/assets/codapi

   # Download the files
   curl -o source/assets/codapi/snippet.js https://unpkg.com/@antonz/codapi@0.20.0/dist/snippet.js
   curl -o source/assets/codapi/snippet.css https://unpkg.com/@antonz/codapi@0.20.0/dist/snippet.css
   ```

2. **Update your `_config.yml`** to point to the self-hosted files:
   ```yml
   codapi:
     js: /assets/codapi/snippet.js
     css: /assets/codapi/snippet.css
   ```

The plugin will inject these paths instead of CDN URLs. Hexo will automatically copy files from `source/assets/` to `public/assets/` during generation.

---

## How it works

1. `{% codapi %}` expands to:

   ```html
   <pre>...</pre>
   <codapi-snippet ...></codapi-snippet>
   ```
2. During `after_render:html`, the plugin:

   * Detects `<codapi-snippet>` in the rendered page
   * Injects `snippet.css` into `<head>`
   * Injects `snippet.js` before `</body>`
3. Pages without Codapi snippets remain untouched

This guarantees:

* No global JS/CSS bloat
* Full theme compatibility

---

## Notes & Limitations

* Some Codapi sandboxes run fully in-browser; others require a Codapi server.
* This plugin only handles **embedding**, not server configuration.
* If your theme omits `</head>` or `</body>` (very rare), injection will be skipped safely.

---

## License

MIT

---

## Credits

* [Codapi](https://codapi.org) by Anton Zhiyanov
* Hexo plugin API
