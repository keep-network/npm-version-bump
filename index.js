const core = require("@actions/core")
const { resolve } = require("path")

const { Package } = require("./src/package.js")
const { VersionResolver } = require("./src/version-resolver.js")

async function run() {
  try {
    const workDir = core.getInput("workDir") || __dirname // TODO: Try to replace with step run `working_directory` property.
    const isPrerelease = core.getInput("isPrerelease") || true
    const preid = core.getInput("preid")

    const npmPackage = Package.fromFile(resolve(workDir, "package.json"))

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

    core.info(`saving version to package.json file: ${latestVersion}`)
    versionResolver.package.updateVersion(latestVersion)

    const newVersion = await versionResolver.bumpVersion()

    core.setOutput("version", newVersion)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
