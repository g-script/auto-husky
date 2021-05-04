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

There is only one argument to provide: **WORKINGDIRECTORY**. This is the directory where command will be executed, it should point to the directory under which `.git` folder is located. It defaults to current working directory, and supports relative paths.

There is also a few flags available:

**`--interactive`** (`-i`)

Turn on interactive mode.

This option will interactively ask you questions matching following flags. You can preset all answers through matching flags, but only boolean flags will not be asked again.

**`--destination`** (`-d`)

Set a custom installation directory for husky.

This should point to the directory where your `package.json` file is located. It defaults to working directory and must be set as relative to it.

**`--[no-]yarn2`**

Setup husky for yarn 2. It will use `postinstall` script rather than `prepare` script, which is not supported by yarn 2.

**`--[no-]pinst`** (`-p`)

Install and setup [pinst](https://www.npmjs.com/package/pinst).

This option will add two scripts (`prepublishOnly` and `postpublish`) that will disable `postinstall` script when publishing your package to a registry.

> **This is only useful for yarn 2 projects!**
> It is not needed with npm or yarn because they do not use `postinstall` script to automatically install husky.

**`--[no-]fix-gitkraken`** (`-g`)

Automatically apply [compatibility fix for Gitkraken](https://github.com/typicode/husky/issues/875).

**Examples:**

```shell
# Most common usage
$ auto-husky

# Fully interactive usage
$ auto-husky -i

# Preset some answers for interactive mode
$ auto-husky -i --no-pinst

# Usage with custom folder
$ auto-husky -d ./custom-folder
```

## :1234: Versioning

This project uses [SemVer](http://semver.org) for versioning. For the versions available, see the [tags on this repository](https://github.com/g-script/auto-husky/tags).
