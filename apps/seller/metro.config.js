const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../../"); // adjust if needed

const config = getDefaultConfig(projectRoot);

// Allow importing from outside this project
config.watchFolders = [workspaceRoot];

// Add `.tsx` and `.ts` extensions if missing
config.resolver.sourceExts.push("ts", "tsx");

// Allow packages from outside to be resolved
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
