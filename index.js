const core = require("@actions/core")
const { isAbsolute, join, resolve } = require("path")
const { convertBranch, resolveWorkingDirectory } = require("./src/utils.js")

const { Package } = require("./src/package.js")
const { VersionResolver } = require("./src/version-resolver.js")

async function run() {
  try {
    console.log("core.isDebug", core.isDebug())

    const workDir = core.getInput("work-dir")
    const isPrerelease = core.getInput("is-prerelease")
    const environment = core.getInput("environment")
    const branch = convertBranch(core.getInput("branch"))
    const commit = core.getInput("commit")

    const packageJsonPath = join(
      resolveWorkingDirectory(workDir),
      "package.json"
    )

    const versionResolver = new VersionResolver(
      packageJsonPath,
      environment,
      isPrerelease,
      branch,
      commit
    )

    let latestVersion = await versionResolver.getLatestPublishedVersion()

    // If no published versions are found use the current one from package.json.
    if (!latestVersion) {
      const currentVersion = versionResolver.package.version

      core.info(`latest version not found; using current ${currentVersion}`)
      latestVersion = currentVersion
    }

    core.info(`saving version ${latestVersion} to package.json file`)
    versionResolver.package.storeVersionInFile(latestVersion.toString())

    const newVersion = await versionResolver.bumpVersion()

    core.info(`version bumped to: ${newVersion}`)

    core.setOutput("version", newVersion.toString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
