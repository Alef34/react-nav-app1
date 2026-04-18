// Auto-generates src/version.ts with version and build time
const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");

const version = pkg.version || "0.0.0";
const now = new Date();
const timestamp = now.toISOString().replace("T", " ").substring(0, 19);

const content = `// This file is auto-generated during build\nexport const APP_VERSION = \"${version} (${timestamp})\";\n`;

fs.writeFileSync(path.join(__dirname, "../src/version.ts"), content);
console.log("Generated src/version.ts:", content);

/*
npm version patch
npm version minor
npm version major
 */
