const core = require("@actions/core")
const { resolve } = require("path")
const { exec } = require("child_process")

const { Package } = require("./package.js")

const DEFAULT_PREID = "pre"

class VersionResolver {
  constructor(workingDir, npmPackage, isPrerelease, preid) {
    this.workingDir = resolve(workingDir)

    this.package = npmPackage

    if (!this.package || !this.package.version) {
      throw new Error(
        `name and version have to be defined; found name: ${this.package.name}, version: ${this.package.version}`
      )
    }

    this.isPrerelease = isPrerelease

    this.preid = preid
    if (this.isPrerelease && !preid) {
      this.preid = VersionResolver.resolvePreid(this.package.version)
    }

    core.debug(
      `initialized package version resolver with properties:
    workingDir:   ${this.workingDir}
    name:         ${this.package.name}
    version:      ${this.package.version}
    isPrerelease: ${this.isPrerelease}
    preid:        ${this.preid}`
    )
  }

  static resolvePreid(version) {
    core.info(`resolving current version preid...`)

    // Find preid in the current version.
    const result = version.match("^.*-([^.]*).*$")

    let preid
    if (result && result[1]) {
      preid = result[1]
      core.info(`found preid: ${preid}`)
    } else {
      preid = DEFAULT_PREID
      core.info(`preid not found; using default: ${preid}`)
    }

    return preid
  }

  async getLatestPublishedVersion() {
    const name = this.package.name
    const currentVersion = this.package.version

    const query = `${name}@^${currentVersion}`

    core.info(`get latest version matching ${query}`)

    return new Promise((resolve, reject) => {
      const command = `npm show -json ${query} version`

      core.info(`$ ${command}`)
      exec(`cd ${this.workingDir} && ${command}`, (err, stdout, stderr) => {
        if (err != null) {
          return reject(err)
        }
        if (stderr) {
          core.error(stderr)
        }

        if (!stdout) {
          core.warning("command output is empty")
          return resolve()
        }

        core.debug(stdout)

        let versions
        try {
          versions = JSON.parse(stdout)
        } catch (err) {
          core.warn(
            `failed to parse output: [${err.message}] output: ${stdout}`
          )
          return resolve()
        }

        let latestVersion
        if (Array.isArray(versions)) {
          latestVersion = versions.slice(-1)[0] // get last array item
        } else {
          latestVersion = versions
        }

        return resolve(latestVersion)
      })
    })
  }

  async bumpVersion() {
    if (!this.isPrerelease) {
      throw new Error("only prerelease version bump is supported")
    }

    return new Promise((resolve, reject) => {
      const command = `npm version prerelease --preid=${this.preid} --no-git-tag-version`

      core.info(`$ ${command}`)

      exec(`cd ${this.workingDir} && ${command}`, (err, stdout, stderr) => {
        if (err != null) {
          return reject(err)
        }
        if (stderr) {
          return reject(stderr)
        }

        if (!stdout) {
          core.warn("command output is empty")
          return resolve()
        }

        core.debug(stdout)

        const newVersion = stdout.trim()

        return resolve(newVersion) // TODO: Resolve specific version
      })
    })
  }
}

module.exports = { VersionResolver }
