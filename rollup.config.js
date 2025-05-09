import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import license from "rollup-plugin-license";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import pkjson from "./package.json";
import babelrc from "./.babelrc.json";

const INPUT_FILE = "src/index.js";
const IS_DEV = process.env.NODE_ENV === "dev";
const CURRENT_YEAR = new Date().getFullYear();

const createBanner = () => `/*!
* Proton v${pkjson.version}
* https://github.com/drawcall/Proton
*
* Copyright 2013-${CURRENT_YEAR}, drawcall
* Licensed under the MIT license
* http://www.opensource.org/licenses/mit-license
*
*/`;

const removeExportsPlugin = {
  name: "remove-exports",
  transform(code, id) {
    if (id.endsWith(INPUT_FILE)) {
      console.log("remove-exports: Removing exports from", id);
      return code.replace(/export\s*{[\s\S]*?};/g, "");
    }
    return null;
  },
};

const createBabelPlugin = () =>
  babel({
    exclude: "node_modules/**",
    babelHelpers: "bundled",
    babelrc: false,
    ...babelrc,
  });

const createConfig = (outputFile, isWeb, plugins) => ({
  input: INPUT_FILE,
  output: {
    file: outputFile,
    format: isWeb ? "iife" : "umd",
    name: "Proton",
    exports: isWeb ? "auto" : "named",
    sourcemap: IS_DEV ? false : true,
    ...(isWeb ? { extend: true } : {}),
  },
  plugins,
});

const devConfigs = [
  createConfig("build/proton.js", false, [createBabelPlugin()]),
  createConfig("build/proton.web.js", true, [removeExportsPlugin, createBabelPlugin()]),
];

const prodConfigs = [
  createConfig("build/proton.min.js", false, [
    createBabelPlugin(),
    typescript({ tsconfig: "./tsconfig.json" }),
    terser(),
    license({ banner: createBanner() }),
  ]),
  createConfig("build/proton.web.min.js", true, [
    removeExportsPlugin,
    createBabelPlugin(),
    typescript({ tsconfig: "./tsconfig.json" }),
    terser(),
    license({ banner: createBanner() }),
  ]),
];

const dtsConfig = {
  input: INPUT_FILE,
  output: [{ file: "build/proton.d.ts", format: "es" }],
  plugins: [dts({ respectExternal: true })],
};

export default [...(IS_DEV ? devConfigs : prodConfigs), dtsConfig];
