"use strict";

const { escapeHTML } = require("hexo-util");

function insertBefore(html, marker, snippet) {
    const i = html.indexOf(marker);
    if (i === -1) return html; // If theme doesn't have marker, just give up safely
    return html.slice(0, i) + snippet + "\n" + html.slice(i);
}

module.exports = function (hexo) {
    // ---- Config ----
        const cfg = hexo.config.codapi || {};
        const version = cfg.version || "0.20.0";
        const jsUrl =
            cfg.js || `https://unpkg.com/@antonz/codapi@${version}/dist/snippet.js`;
        const cssUrl =
            cfg.css ||
            `https://unpkg.com/@antonz/codapi@${version}/dist/snippet.css`;

        const defaultSandbox = cfg.default_sandbox || "go";
        const defaultEditor = cfg.default_editor || "basic";

        // ---- 1) Tag plugin: {% codapi <sandbox> <editor> [engine=...] [selector=...] %} ... {% endcodapi %} ----
        hexo.extend.tag.register(
            "codapi",
            function (args, content) {
                const sandbox = args[0] || defaultSandbox;
                const editor = args[1] || defaultEditor;

                const engine = args
                    .find((a) => a.startsWith("engine="))
                    ?.split("=")[1];
                const selector = args
                    .find((a) => a.startsWith("selector="))
                    ?.split("=")[1];

                const code = escapeHTML((content || "").trim());

                const attrs = [`sandbox="${sandbox}"`, `editor="${editor}"`];
                if (engine) attrs.push(`engine="${engine}"`);
                if (selector) attrs.push(`selector="${selector}"`);

                // Codapi attaches to the preceding code element by default (or via selector). :contentReference[oaicite:2]{index=2}
                return [
                    `<pre class="codapi-code">${code}</pre>`,
                    `<codapi-snippet ${attrs.join(" ")}></codapi-snippet>`,
                ].join("\n");
            },
            { ends: true },
        );

        // ---- 2) Per-page injection: after_render:html ----
        // Filters can modify the rendered HTML by returning a new string. :contentReference[oaicite:3]{index=3}
        hexo.extend.filter.register(
            "after_render:html",
            function (html) {
                if (!html || typeof html !== "string") return html;

                // Only act if this page contains codapi-snippet
                if (!html.includes("<codapi-snippet")) return html;

                // Avoid duplicates if theme/user already included Codapi assets
                const hasJs =
                    html.includes("codapi") && html.includes("snippet.js");
                const hasCss =
                    html.includes("codapi") && html.includes("snippet.css");

                let out = html;

                if (!hasCss) {
                    out = insertBefore(
                        out,
                        "</head>",
                        `<link rel="stylesheet" href="${cssUrl}">`,
                    );
                }
                if (!hasJs) {
                    out = insertBefore(
                        out,
                        "</body>",
                        `<script src="${jsUrl}"></script>`,
                    );
                }

                return out;
            },
            cfg.priority ?? 10,
        );
};
