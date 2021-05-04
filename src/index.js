const {Command, flags: oFlags} = require('@oclif/command')
const fs = require('fs')
const husky = require('husky')
const inquirer = require('inquirer')
const path = require('path')

const {log} = require('./utils')

const CURRENT_WORKING_DIRECTORY = process.cwd()

class HuskyInstallCommand extends Command {
  /**
   * Check working directory exists and is a Git repository
   * @param {String} workingDirectory path to working directory
   * @returns {Boolean|String} true if value is valid, error message otherwise
   */
  checkWorkingDirectory(workingDirectory) {
    if (!fs.existsSync(workingDirectory)) {
      return `Working directory is invalid (missing directory or invalid permissions): ${workingDirectory}`
    }

    const gitDir = path.join(workingDirectory, '.git')

    if (!fs.existsSync(gitDir)) {
      return 'Working directory is not a Git repository'
    }

    return true
  }

  /**
   * Check installation directory exists
   * @param {String} installDirectory path to installation directory
   * @returns {Boolean|String} true if value is valid, error message otherwise
   */
  checkInstallDirectory(installDirectory) {
    if (!fs.existsSync(installDirectory)) {
      return `Installation directory is invalid (missing directory or invalid permissions): ${installDirectory}`
    }

    return true
  }

  /**
   * Main function
   * @returns {void}
   */
  async run() {
    const {args, flags} = this.parse(HuskyInstallCommand)
    const defaultDestination = path.resolve(args.workingDirectory, flags.destination || '')
    let interactiveOptions = {}

    if (flags.interactive) {
      await inquirer.prompt([{
        name: 'workingDirectory',
        type: 'input',
        message: 'Enter working directory:',
        default: args.workingDirectory,
        filter: input => path.resolve(args.workingDirectory, input),
        validate: this.checkWorkingDirectory,
      }, {
        name: 'destination',
        type: 'input',
        message: 'Enter installation directory:',
        default: answers => path.resolve(answers.workingDirectory, flags.destination || ''),
        filter: (input, answers) => path.resolve(answers.workingDirectory, input),
        validate: this.checkInstallDirectory,
      }, {
        when: flags.pinst === undefined,
        name: 'yarn2',
        type: 'confirm',
        message: 'Use yarn 2 (berry)?',
        default: Boolean(flags.yarn2),
      }, {
        when: flags.pinst === undefined,
        name: 'pinst',
        type: 'confirm',
        message: 'Use pinst?',
        default: Boolean(flags.pinst),
      }, {
        when: flags['fix-gitkraken'] === undefined,
        name: 'gitkrakenFix',
        type: 'confirm',
        message: 'Apply Gitkraken fix?',
        default: Boolean(flags['fix-gitkraken']),
      }]).then(answers => {
        interactiveOptions = answers
      })
    } else {
      const wdCheck = this.checkWorkingDirectory(args.workingDirectory)

      if (wdCheck !== true) {
        throw new Error(wdCheck)
      }

      const destCheck = this.checkInstallDirectory(defaultDestination)

      if (destCheck !== true) {
        throw new Error(destCheck)
      }
    }

    const options = {
      workingDirectory: args.workingDirectory,
      destination: defaultDestination,
      yarn2: Boolean(flags.yarn2),
      pinst: Boolean(flags.pinst),
      gitkrakenFix: Boolean(flags['fix-gitkraken']),
      ...interactiveOptions,
    }

    log(`Installing husky into ${options.workingDirectory}`)

    const pkgPath = path.join(options.destination, 'package.json')
    const pkgContent = await fs.promises.readFile(pkgPath, {
      encoding: 'utf8',
    })
    const originalPkgIndent = /^[ ]+|\t+/m.exec(pkgContent)?.[0]
    const pkg = JSON.parse(pkgContent)

    if (!pkg.devDependencies) {
      pkg.devDependencies = {}
    }

    pkg.devDependencies.husky = '^6.0.0'

    if (options.gitkrakenFix) {
      pkg.devDependencies.shx = '^0.3.3'
    }

    if (!pkg.scripts) {
      pkg.scripts = {}
    }

    const huskyDir = path.join(options.destination, '.husky')
    let installScript = 'husky install'

    if (options.destination !== options.workingDirectory) {
      installScript = `cd ${path.relative(options.destination, options.workingDirectory)} && husky install ${path.relative(options.workingDirectory, huskyDir)}`
    }

    if (options.gitkrakenFix) {
      const relativeHooksDir = path.relative(options.destination, path.join(options.workingDirectory, '.git/hooks'))

      installScript += ` && shx rm -rf ${relativeHooksDir} && shx ln -s ${path.relative(path.join(options.workingDirectory, '.git'), huskyDir)} ${relativeHooksDir}`
    }

    if (options.yarn2) {
      if (pkg.scripts.postinstall) {
        pkg.scripts['postinstall:old'] = pkg.scripts.postinstall
      }

      pkg.scripts.postinstall = installScript
    } else {
      if (pkg.scripts.prepare) {
        pkg.scripts['prepare:old'] = pkg.scripts.prepare
      }

      pkg.scripts.prepare = installScript
    }

    if (options.pinst) {
      if (pkg.scripts.prepublishOnly) {
        pkg.scripts['prepublishOnly:old'] = pkg.scripts.prepublishOnly
      }

      if (pkg.scripts.postpublish) {
        pkg.scripts['postpublish:old'] = pkg.scripts.postpublish
      }

      pkg.scripts.prepublishOnly = 'pinst --disable'
      pkg.scripts.postpublish = 'pinst --enable'
      pkg.devDependencies.pinst = '^2.1.6'
    }

    await fs.promises.writeFile(pkgPath, `${JSON.stringify(pkg, null, originalPkgIndent)}\n`)

    log('Successfully updated package.json')

    process.chdir(options.workingDirectory)
    husky.install(huskyDir)
    husky.set(path.join(huskyDir, 'pre-commit'), 'npm test')
  }
}

HuskyInstallCommand.description = `Installing husky made easy as woof!
This tool allows you to automatically install husky in several project topologies.`

HuskyInstallCommand.flags = {
  version: oFlags.version({char: 'v'}),
  help: oFlags.help({char: 'h'}),
  interactive: oFlags.boolean({
    char: 'i',
    description: 'turn on interactive mode',
    default: false,
  }),
  destination: oFlags.string({
    char: 'd',
    description: "husky's installation directory if different than working directory",
  }),
  yarn2: oFlags.boolean({
    description: 'setup for yarn 2',
    allowNo: true,
  }),
  pinst: oFlags.boolean({
    char: 'p',
    description: 'install and enable pinst',
    allowNo: true,
  }),
  'fix-gitkraken': oFlags.boolean({
    char: 'g',
    description: 'automatically fix Gitkraken incompatibility with husky v5+ (see https://github.com/typicode/husky/issues/875)',
    allowNo: true,
  }),
}

HuskyInstallCommand.args = [{
  name: 'workingDirectory',
  description: 'Directory where command is executed',
  default: CURRENT_WORKING_DIRECTORY,
  parse: input => path.resolve(input),
}]

module.exports = HuskyInstallCommand
