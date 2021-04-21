const { isAbsolute, resolve } = require("path")

/**
 * @param {string} string
 * @return {string}
 */
function convertBranch(string) {
  // We're replacing characters in the branch name:
  // - `/` is invalid for semver,
  // - `.` in the regexp we use for version metadata parsing it starts the commit
  //    hash part.
  return string.replace(/[\/\.]/g, "-")
}

function resolveWorkingDirectory(workDir) {
  if (isAbsolute(workDir)) {
    return normalize(workDir)
  } else {
    return resolve(ROOT_DIR, workDir)
  }
}

module.exports = { convertBranch, resolveWorkingDirectory }
