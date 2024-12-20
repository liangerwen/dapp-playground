const path = require("path");

const buildNextEslintCommand = (filenames) =>
  `yarn lint --fix --file ${filenames
    .map((f) => path.relative(path.join("packages", "web"), f))
    .join(" --file ")}`;

module.exports = {
  "packages/web/**/*.{ts,tsx}": [buildNextEslintCommand],
};
