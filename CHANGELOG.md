# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-12-24

### Breaking Changes
- **ESM as default**: The package now uses ES Modules by default. CommonJS is still supported via `.eleventy.cjs`.
- **Peer dependency**: `@11ty/eleventy` is now a peer dependency (>=2.0.0) instead of a direct dependency.

### Fixed
- **scriptAttributes now works**: The `scriptAttributes` option was previously captured but never applied to script elements. It now correctly adds custom attributes to dynamically created HubSpot script tags. This enables cookie consent tool bypasses (e.g., OneTrust with `data-ot-ignore`).

### Changed
- Updated to Node.js 22 in CI/CD pipeline.
- Updated documentation with ESM examples and `scriptAttributes` usage.

### Migration Guide

**From v1.x to v2.0:**

If you're using Eleventy 3.x (ESM):
```js
// Before (v1.x)
const eleventyPluginHubspot = require('eleventy-plugin-hubspot');
module.exports = function (eleventyConfig) { ... };

// After (v2.0)
import eleventyPluginHubspot from 'eleventy-plugin-hubspot';
export default function (eleventyConfig) { ... };
```

If you're using Eleventy 2.x (CommonJS), no changes needed - the package automatically uses the CJS version.

## [1.3.5] - Previous releases

See [GitHub releases](https://github.com/reatlat/eleventy-plugin-hubspot/releases) for earlier changelog.
