const { convertBranch } = require("../src/utils.js")

const { expect } = require("chai")

describe("Utils", function () {
  describe("convertBranch", () => {
    it("replaces / with -", async () => {
      const branch = "feature/branch/name-23/12"
      const expected = "feature-branch-name-23-12"

      const actual = convertBranch(branch)

      console.log("actual", actual)

      expect(actual).equal(expected)
    })

    it("replaces . with -", async () => {
      const branch = "feature.branch.name-23.12"
      const expected = "feature-branch-name-23-12"

      const actual = convertBranch(branch)

      console.log("actual", actual)

      expect(actual).equal(expected)
    })

    it("mixed case", async () => {
      const branch = "feature/branch/name.23.12"
      const expected = "feature-branch-name-23-12"

      const actual = convertBranch(branch)

      console.log("actual", actual)

      expect(actual).equal(expected)
    })
  })
})
