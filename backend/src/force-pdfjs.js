// Force the bundler to keep the exact module path we need at runtime.
// NOTE: use .js (not .mjs) because 3.11.174 ships legacy/*.js files.
import "pdfjs-dist/legacy/build/pdf.js";
