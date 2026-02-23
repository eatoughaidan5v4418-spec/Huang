const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Exclude Windows system/app directories that Metro can't read (EPERM errors)
config.resolver.blockList = [
  /.*\\AppData\\.*/,
  /.*\/AppData\/.*/,
];

module.exports = config;
