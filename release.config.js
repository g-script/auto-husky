const presetConfig = {
  types: [{
    type: 'feat',
    section: 'Features',
  }, {
    type: 'fix',
    section: 'Bug Fixes',
  }, {
    type: 'docs',
    section: 'Documentation',
  }, {
    type: 'chore',
    hidden: true,
  }, {
    type: 'style',
    hidden: true,
  }, {
    type: 'refactor',
    hidden: true,
  }, {
    type: 'perf',
    hidden: true,
  }, {
    type: 'test',
    hidden: true,
  }],
}

module.exports = {
  branches: ['main', 'next'],
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: 'conventionalcommits',
      presetConfig,
    }],
    ['@semantic-release/release-notes-generator', {
      preset: 'conventionalcommits',
      presetConfig,
      linkCompare: false,
      linkReferences: false,
    }],
    '@semantic-release/npm',
    ['@semantic-release/git', {
      assets: ['package.json'],
      message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    }],
  ],
}
