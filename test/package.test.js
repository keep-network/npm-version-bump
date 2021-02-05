const { Package } = require("../src/package.js")

const { expect } = require("chai")

const { resolve } = require("path")
const { existsSync, mkdirSync, copyFileSync } = require("fs")

const PACKAGE_JSON_STRING = `{"name":"test-package","version":"9.8.7-rc.85+abcd"}`
const PACKAGE_JSON_FILE_PATH = "./test/data/package.json"

describe("Package", function () {
  describe("fromJSON", () => {
    it("loads package data from a JSON string", async () => {
      const expected = new Package("test-package", "9.8.7-rc.85+abcd")

      const actual = Package.fromJSON(PACKAGE_JSON_STRING)

      expect(actual).deep.equal(expected)
    })
  })

  describe("fromFile", () => {
    it("loads package data from a JSON file", async () => {
      const expected = new Package(
        "@keep-network/test-package",
        "1.2.3-rc.0+9876543",
        resolve(PACKAGE_JSON_FILE_PATH)
      )

      const actual = Package.fromFile(PACKAGE_JSON_FILE_PATH)

      expect(actual).deep.equal(expected)
    })
  })

  describe("updateVersion", () => {
    const tempDir = "./tmp"
    const tempFilePath = resolve(tempDir, "package.json")

    const newVersion = "9.0.0-pre.12+xyz"

    let package1

    before(() => {
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir)
      }
    })

    beforeEach(() => {
      copyFileSync(PACKAGE_JSON_FILE_PATH, tempFilePath)
      package1 = Package.fromFile(tempFilePath)
    })

    it("fails for invalid semver new version", async () => {
      expect(() => package1.updateVersion("1.2.3.4")).to.throw(
        Error,
        "invalid version provided: 1.2.3.4"
      )
    })

    it("fails if package file path is not defined", async () => {
      const packageNoFile = Package.fromJSON(PACKAGE_JSON_STRING)

      expect(() => packageNoFile.updateVersion(newVersion)).to.throw(
        Error,
        "file path not defined"
      )
    })

    it("stores new version in the package file", async () => {
      package1.updateVersion(newVersion)

      const actual = Package.fromFile(tempFilePath)
      const expected = new Package(
        "@keep-network/test-package",
        newVersion,
        resolve(tempFilePath)
      )

      expect(actual).deep.equal(expected)
    })
  })
})
