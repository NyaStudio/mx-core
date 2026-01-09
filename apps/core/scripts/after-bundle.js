const fs = require('node:fs')
const path = require('node:path')

const buildDir = path.resolve(__dirname, '../out')
const hasBuild = fs.existsSync(buildDir)
if (!hasBuild) {
  throw new Error('No build folder found')
}

// Create index.js as entry point that requires the actual main file
const indexFilePath = path.resolve(buildDir, 'index.js')

fs.writeFileSync(
  indexFilePath,
  `#!/usr/bin/env node
require('./src/main.js');`,
)

fs.chmodSync(indexFilePath, '755')

console.log('✓ Created index.js entry point')
