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

// Fix package.json: remove workspace dependencies and move runtime deps
const packageJsonPath = path.resolve(buildDir, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

// Remove @mx-space/compiled from dependencies since we manually copied it
if (
  packageJson.dependencies &&
  packageJson.dependencies['@mx-space/compiled']
) {
  delete packageJson.dependencies['@mx-space/compiled']
  console.log('✓ Removed workspace dependency: @mx-space/compiled')
}

// Move runtime dependencies from devDependencies to dependencies
const runtimeDeps = ['ioredis', 'sharp', 'socket.io']
if (!packageJson.dependencies) {
  packageJson.dependencies = {}
}

runtimeDeps.forEach((dep) => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    packageJson.dependencies[dep] = packageJson.devDependencies[dep]
    console.log(`✓ Moved ${dep} to dependencies`)
  }
})

// Ensure peer dependencies are explicit
// mongoose requires mongodb but it's a peer dependency
if (packageJson.dependencies.mongoose && !packageJson.dependencies.mongodb) {
  // Extract mongoose version to determine compatible mongodb version
  packageJson.dependencies.mongodb = '^6.3.0'
  console.log('✓ Added mongodb as explicit dependency')
}

// Remove devDependencies completely for production
delete packageJson.devDependencies

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

console.log('✓ Updated package.json')
