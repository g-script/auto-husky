<!-- omit in toc -->
# auto-husky

Installing husky made easy as woof! 🐶

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/auto-husky.svg)](https://npmjs.org/package/auto-husky)
[![Downloads/week](https://img.shields.io/npm/dw/auto-husky.svg)](https://npmjs.org/package/auto-husky)
[![License](https://img.shields.io/npm/l/auto-husky.svg)](https://github.com/g-script/auto-husky/blob/master/package.json)

<!-- omit in toc -->
## :bookmark_tabs: Table of contents

- [:floppy_disk:Installation](#floppy_diskinstallation)
- [:beginner:Usage](#beginnerusage)

## :floppy_disk:Installation

You can install the package globally if you need it regularly:

```shell
$ npm install -g husky-install
```

Or you can run it directly with `npx`:

```shell
$ npx husky-install
```

## :beginner:Usage

This package can be used in fully interactive mode or by specifying some options.

There is only one argument to provide: WORKINGDIRECTORY. This is the directory where command will be executed, it should point to the directory where `.git` folder is located.

There is a few flags available:

- **manager:** package manager to use
- **destination:** husky custome installation directory
- **pinst:** install and setup [pinst](https://www.npmjs.com/package/pinst) on `prepublishOnly` and `postpublish` npm lifecycle events
- **[no-]fix-gitkraken:** automatically apply [compatibility fix for Gitkraken](https://github.com/typicode/husky/issues/875)
