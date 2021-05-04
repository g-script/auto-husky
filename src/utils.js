const execa = require('execa')

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

const log = message => {
  console.log(`auto-husky - ${message}`)
}

module.exports = {
  getAvailableManagers,
  log,
}
