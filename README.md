# NPM Package Version Bump Action

<p align="left">
  <a href="https://github.com/keep-network/npm-version-bump/actions">
    <img alt="javscript-action status" src="https://github.com/actions/javascript-action/workflows/units-test/badge.svg">
  </a>
</p>

This is a GitHub Action that bumps version of a NPM Package.

## Inputs

The action supports following input parameters:

- `workDir` (optional, default: `.`) - location of `package.json` file,

- `isPrerelease` (optional, default: `true`) - defines if the version is a prerelease,
  currently only `true` is supported,

- `preid` (optional, default: `pre`) - prerelease id.

## Usage

<!-- prettier-ignore-start -->
```yaml
- uses: keep-network/npm-version-bump@v1
  with:
    workDir: ./contracts  # optional, default: .
    isPrerelease: false   # optional, default: true
    preid: rc             # optional, default: pre
```
<!-- prettier-ignore-end -->

## Outputs

The action outputs `version` property with a value of the resolved package version.

Example usage:

```yaml
- uses: keep-network/npm-version-bump@v1
  id: bump-version
- name: Print resolved version
  run: echo "Resolved new version ${{ steps.bump-version.outputs.version }}"
```
