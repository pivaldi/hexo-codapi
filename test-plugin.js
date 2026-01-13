#!/usr/bin/env node
"use strict";

// Test script to verify the plugin loads and registers correctly

console.log("Testing hexo-codapi plugin...\n");

try {
    // Try to load the plugin
    const plugin = require('./index.js');
    console.log("✓ Plugin module loads successfully");
    console.log("✓ Plugin exports:", typeof plugin);

    if (typeof plugin !== 'function') {
        console.error("✗ ERROR: Plugin should export a function");
        process.exit(1);
    }

    // Create a minimal Hexo mock to test registration
    const hexoMock = {
        config: { codapi: {} },
        extend: {
            tag: {
                register: (name, fn, opts) => {
                    console.log(`✓ Tag registered: "${name}" with options:`, opts);
                },
                env: { extensions: {} }
            },
            filter: {
                register: (name, fn, priority) => {
                    console.log(`✓ Filter registered: "${name}" with priority:`, priority);
                }
            }
        }
    };

    // Call the plugin function with the mock
    plugin(hexoMock);

    console.log("\n✓ All checks passed! Plugin should work correctly.");
    console.log("\nIf Hexo still doesn't see the plugin, try:");
    console.log("1. npm pack (creates hexo-codapi-0.1.0.tgz)");
    console.log("2. In your Hexo blog: npm install /path/to/hexo-codapi-0.1.0.tgz");

} catch (error) {
    console.error("✗ ERROR:", error.message);
    console.error(error.stack);
    process.exit(1);
}
