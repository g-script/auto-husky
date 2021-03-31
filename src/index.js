const {Command, flags: oFlags} = require('@oclif/command')
const execa = require('execa')
const fs = require('fs')
const husky = require('husky')
const inquirer = require('inquirer')
const path = require('path')

const log = message => {
  console.log(`auto-husky - ${message}`)
}

const checkDir = (dir, error) => {
  if (!fs.existsSync(dir)) {
    throw new Error(error)
  }
}

const getAvailableManagers = async () => {
  const pkgManagers = []

  await execa('npm', ['--version'])
  .then(() => {
    pkgManagers.push('npm')
  })
  .catch(() => {})
  await execa('yarn', ['--version'])
  .then(() => {
    pkgManagers.push('yarn')
    pkgManagers.push('yarn 2')
  })
  .catch(() => {})

  if (pkgManagers.length === 0) {
    throw new Error('No supported package manager found on your system')
  }

  return pkgManagers
}

const initPkg = async (pkgPath, manager, destination) => {
  if (!fs.existsSync(pkgPath)) {
    await execa(manager, ['init', '-y'], {
      cwd: destination,
    })

    log('Project has been initialized with defaults because no package.json was found in destination directory')
  }
}

class HuskyInstallCommand extends Command {
  async run() {
    const {args, flags} = this.parse(HuskyInstallCommand)
    let pkgManager = flags.manager
    let pinst = flags.pinst
    let destination = flags.destination && path.resolve(args.workingDirectory, flags.destination)
    let gitkrakenFix = flags['fix-gitkraken']

    checkDir(args.workingDirectory, 'Working directory is invalid (missing directory or invalid permissions)')

    const gitDir = path.join(args.workingDirectory, '.git')

    checkDir(gitDir, 'Working directory is not a Git repository')

    if (destination) {
      checkDir(destination, 'Destination directory is invalid (missing directory or invalid permissions)')
    }

    log(`Installing husky into ${args.workingDirectory}`)

    const pkgManagers = await getAvailableManagers()

    await inquirer.prompt([{
      when: !pkgManager,
      name: 'pkgManager',
      type: 'list',
      message: 'Select package manager to use:',
      choices: pkgManagers,
    }, {
      when: !pinst,
      name: 'pinst',
      type: 'confirm',
      message: 'Use pinst (avoids postinstall errors when package is published on a registry) ?',
    }, {
      when: !destination,
      name: 'destination',
      type: 'input',
      message: 'Specify installation directory:',
      default: args.workingDirectory,
      filter: input => path.resolve(args.workingDirectory, input),
      validate: input => fs.existsSync(input) || 'Invalid installation directory',
    }]).then(answers => {
      pkgManager = answers.pkgManager || pkgManager
      pinst = answers.pinst || pinst
      destination = answers.destination || destination
    })

    if (gitkrakenFix === undefined) {
      log('Due to a lack of support of core.hooksPath in Gitkraken, a custom fix is needed to make it compatible with husky 5+ (see https://github.com/typicode/husky/issues/875).')

      await inquirer.prompt([{
        when: gitkrakenFix === undefined,
        name: 'gitkrakenFix',
        type: 'confirm',
        message: 'Apply Gitkraken fix ?',
        default: Boolean(flags['fix-gitkraken']),
      }]).then(answers => {
        gitkrakenFix = answers.gitkrakenFix
      })
    }

    const pkgPath = path.join(destination, 'package.json')
    const pkgManagerCommand = pkgManager === 'npm' ? 'npm' : 'yarn'

    await initPkg(pkgPath, pkgManagerCommand, destination)

    const pkgStr = await fs.promises.readFile(pkgPath, {
      encoding: 'utf8',
    })
    const originalPkgIndent = /^[ ]+|\t+/m.exec(pkgStr)?.[0]
    const pkg = JSON.parse(pkgStr)

    if (!pkg.devDependencies) {
      pkg.devDependencies = {}
    }

    pkg.devDependencies.husky = '^6.0.0'

    if (gitkrakenFix) {
      pkg.devDependencies.shx = '^0.3.3'
    }

    if (!pkg.scripts) {
      pkg.scripts = {}
    }

    const huskyDir = path.join(destination, '.husky')
    let installScript = 'husky install'

    if (destination !== args.workingDirectory) {
      installScript = `cd ${path.relative(destination, args.workingDirectory)} && husky install ${path.relative(args.workingDirectory, huskyDir)}`
    }

    if (gitkrakenFix) {
      const relativeHooksDir = path.relative(args.workingDirectory, path.join(gitDir, 'hooks'))

      installScript += ` && shx rm -rf ${relativeHooksDir} && shx ln -s ${path.relative(gitDir, huskyDir)} ${relativeHooksDir}`
    }

    if (pkgManager === 'yarn 2') {
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

    if (pinst) {
      if (pkg.scripts.prepublishOnly) {
        pkg.scripts['prepublishOnly:old'] = pkg.scripts.prepublishOnly
      }

      if (pkg.scripts.postpublish) {
        pkg.scripts['postpublish:old'] = pkg.scripts.postpublish
      }

      pkg.scripts.prepublishOnly = 'pinst --disable'
      pkg.scripts.postpublish = 'pinst --enable'
      pkg.devDependencies.pinst = '^2.0.0'
    }

    await fs.promises.writeFile(pkgPath, `${JSON.stringify(pkg, null, originalPkgIndent)}\n`)

    log('Successfully updated package.json')

    process.chdir(args.workingDirectory)
    husky.install(huskyDir)
    husky.set(path.join(huskyDir, 'pre-commit'), 'npm test')
  }
}

HuskyInstallCommand.description = `Installing husky made easy as woof!
This tool allows you to automatically install husky in several projects topology.`

HuskyInstallCommand.flags = {
  version: oFlags.version({char: 'v'}),
  help: oFlags.help({char: 'h'}),
  manager: oFlags.string({
    char: 'm',
    description: 'package manager to use',
    options: ['npm', 'yarn', 'yarn 2'],
  }),
  pinst: oFlags.boolean({
    char: 'p',
    description: 'install and enable pinst',
    allowNo: true,
  }),
  destination: oFlags.string({
    char: 'd',
    description: "husky's installation directory (if different than working directory)",
  }),
  'fix-gitkraken': oFlags.boolean({
    description: 'automatically fix Gitkraken incompatibility with husky v5+ (see https://github.com/typicode/husky/issues/875)',
    allowNo: true,
  }),
}

HuskyInstallCommand.args = [{
  name: 'workingDirectory',
  description: 'Directory where command will be executed',
  default: process.cwd(),
  parse: input => path.resolve(input),
}]

module.exports = HuskyInstallCommand
