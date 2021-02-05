const core = require("@actions/core")
const { isAbsolute, join, resolve } = require("path")

const { Package } = require("./src/package.js")
const { VersionResolver } = require("./src/version-resolver.js")

const ROOT_DIR = process.env.GITHUB_WORKSPACE || __dirname

async function run() {
  try {
    const workDir = core.getInput("workDir")
    const isPrerelease = core.getInput("isPrerelease")
    const preid = core.getInput("preid")

    const packageJsonPath = join(
      resolveWorkingDirectory(workDir),
      "package.json"
    )

    const npmPackage = Package.fromFile(packageJsonPath)

    const versionResolver = new VersionResolver(
      workDir,
      npmPackage,
      isPrerelease,
      preid
    )

    let latestVersion = await versionResolver.getLatestPublishedVersion()

    // If no published versions are found use the current one from package.json.
    if (!latestVersion) {
      const currentVersion = versionResolver.package.version

      core.info(`latest version not found; using current ${currentVersion}`)
      latestVersion = currentVersion
    }

    core.info(`saving version ${latestVersion} to package.json file`)
    versionResolver.package.updateVersion(latestVersion)

    const newVersion = await versionResolver.bumpVersion()

    core.info(`version bumped to: ${newVersion}`)

    core.setOutput("version", newVersion)
  } catch (error) {
    core.setFailed(error.message)
  }
}

function resolveWorkingDirectory(workDir) {
  if (isAbsolute(workDir)) {
    return normalize(workDir)
  } else {
    return resolve(ROOT_DIR, workDir)
  }
}

run()
