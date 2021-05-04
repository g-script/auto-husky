<!-- omit in toc -->

# auto-husky

Installing husky made easy as woof! 🐶

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/auto-husky.svg)](https://npmjs.org/package/auto-husky)
[![Downloads/week](https://img.shields.io/npm/dw/auto-husky.svg)](https://npmjs.org/package/auto-husky)
[![License](https://img.shields.io/npm/l/auto-husky.svg)](https://github.com/g-script/auto-husky/blob/main/package.json)

<!-- omit in toc -->

## :bookmark_tabs: Table of contents

- [:floppy_disk:Installation](#floppy_diskinstallation)
- [:beginner: Usage](#beginner-usage)
- [:1234: Versioning](#1234-versioning)

## :floppy_disk:Installation

You can install the package globally if you need it regularly:

```shell
$ npm install -g auto-husky
```

Or you can run it directly with `npx`:

```shell
$ npx auto-husky
```

## :beginner: Usage

This package can be used in fully interactive mode or by specifying some options.

There is only one argument to provide: WORKINGDIRECTORY. This is the directory where command will be executed, it should point to the directory where `.git` folder is located. It defaults to current working directory, and supports relative paths.

There is a few flags available:

- _--manager_ | _-m_ : package manager to use
- _--destination_ | _-d_ : husky custom installation directory – useful if your `package.json` is not at project root
- _--[no-]pinst_ | _-p_ : install and setup [pinst](https://www.npmjs.com/package/pinst) on `prepublishOnly` and `postpublish` npm lifecycle events – useful if you plan to publish your package to a registry
- _--[no-]fix-gitkraken_ : automatically apply [compatibility fix for Gitkraken](https://github.com/typicode/husky/issues/875)

## :1234: Versioning

This project uses [SemVer](http://semver.org) for versioning. For the versions available, see the [tags on this repository](https://github.com/g-script/auto-husky/tags).
