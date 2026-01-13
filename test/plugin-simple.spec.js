"use strict";

const { expect } = require("chai");
const Hexo = require("hexo");

describe("hexo-codapi", function () {
    let hexo;

    beforeEach(function () {
        hexo = new Hexo(__dirname, { silent: true });

        // Load our plugin
        const plugin = require("../index.js");
        plugin(hexo);
    });

    describe("codapi tag", function () {
        it("should register the codapi tag", function () {
            expect(hexo.extend.tag.env.extensions.codapi).to.exist;
        });

        it("should be a Nunjucks block tag", function () {
            const TagExt = hexo.extend.tag.env.extensions.codapi;
            expect(TagExt).to.have.property("tags");
            expect(TagExt.tags).to.deep.equal(["codapi"]);
        });
    });

    describe("after_render:html filter", function () {
        it("should register after_render:html filter", function () {
            const filters = hexo.extend.filter.store["_after_html_render"];
            expect(filters).to.exist;
            expect(filters.length).to.be.greaterThan(0);
        });

        it("should inject CSS and JS when codapi-snippet is present", function () {
            const filters = hexo.extend.filter.store["_after_html_render"];
            const filter = filters[0];

            const html = `<!DOCTYPE html>
<html>
<head></head>
<body><codapi-snippet sandbox="python"></codapi-snippet></body>
</html>`;

            const result = filter.call(hexo, html);

            expect(result).to.include("snippet.css");
            expect(result).to.include("snippet.js");
            expect(result).to.include("<codapi-snippet");
        });

        it("should not inject assets when codapi-snippet is absent", function () {
            const filters = hexo.extend.filter.store["_after_html_render"];
            const filter = filters[0];

            const html = `<!DOCTYPE html>
<html>
<head></head>
<body><p>Regular content</p></body>
</html>`;

            const result = filter.call(hexo, html);

            expect(result).to.not.include("snippet.css");
            expect(result).to.not.include("snippet.js");
            expect(result).to.equal(html);
        });

        it("should not inject if assets already present", function () {
            const filters = hexo.extend.filter.store["_after_html_render"];
            const filter = filters[0];

            const html = `<!DOCTYPE html>
<html>
<head><link rel="stylesheet" href="https://unpkg.com/@antonz/codapi@0.20.0/dist/snippet.css"></head>
<body>
    <codapi-snippet sandbox="python"></codapi-snippet>
    <script src="https://unpkg.com/@antonz/codapi@0.20.0/dist/snippet.js"></script>
</body>
</html>`;

            const result = filter.call(hexo, html);

            // Should not add duplicate assets
            const cssCount = (result.match(/snippet\.css/g) || []).length;
            const jsCount = (result.match(/snippet\.js/g) || []).length;

            expect(cssCount).to.equal(1);
            expect(jsCount).to.equal(1);
        });

        it("should inject CSS before </head> and JS before </body>", function () {
            const filters = hexo.extend.filter.store["_after_html_render"];
            const filter = filters[0];

            const html = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <codapi-snippet sandbox="python"></codapi-snippet>
</body>
</html>`;

            const result = filter.call(hexo, html);

            const headIndex = result.indexOf("</head>");
            const cssIndex = result.indexOf("snippet.css");
            const bodyIndex = result.indexOf("</body>");
            const jsIndex = result.indexOf("snippet.js");

            expect(cssIndex).to.be.lessThan(headIndex);
            expect(jsIndex).to.be.lessThan(bodyIndex);
        });
    });
});
