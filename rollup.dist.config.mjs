import typescript from "@rollup/plugin-typescript";
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import fs from "node:fs";
import path from "node:path";

const pkgLoc = new URL("./package.json", import.meta.url);
const pkg = JSON.parse(fs.readFileSync(pkgLoc, "utf8"));

export default {
  input: "src/browser-entry.ts",
  output: [
    {
      file: "dist/remark-docx.js",
      format: "iife", // Immediately Invoked Function Expression for browser global
      name: "RemarkDocxBundle", // Global variable name for the entire bundle
      sourcemap: true,
      globals: {
        // 这些库需要从CDN加载
        'katex': 'katex',
        'mathml2omml': 'mathml2omml'
      }
    },
    {
      file: "dist/remark-docx.esm.js",
      format: "es", // ES Module for modern browsers
      sourcemap: true
    }
  ],
  plugins: [
    resolve({
      browser: true, // Resolve browser-specific modules
      preferBuiltins: false // Do not prefer Node.js built-ins
    }),
    commonjs(), // Convert CommonJS modules to ES6
    json(), // Import JSON files
    typescript({
      tsconfig: "./tsconfig.json",
      outDir: "dist",
      declaration: false, // No declaration files for browser bundle
      exclude: ["**/*.{spec,stories,test}.*", "**/__snapshots__/**"],
    }),
    terser() // Minify the output
  ],
  external: (id) => {
    // 外部化 Node.js 特定模块和CDN加载的库
    const nodeModules = ['fs', 'path', 'os', 'crypto', 'stream', 'util', 'events'];
    const cdnModules = ['katex', 'mathml2omml'];
    
    return nodeModules.some(module => id === module || id.startsWith(module + '/')) ||
           cdnModules.some(module => id === module || id.startsWith(module + '/'));
  },
  onwarn: (warning, warn) => {
    // 忽略某些警告
    if (warning.code === 'UNRESOLVED_IMPORT' && warning.source === 'fs') {
      return;
    }
    if (warning.code === 'UNRESOLVED_IMPORT' && warning.source === 'path') {
      return;
    }
    warn(warning);
  }
};
