export function addPathTags (paths, tags) {
  if (typeof tags === 'string') {
    tags = [ tags ]
  }

  Object.values(paths).forEach(pathConf => {
    if (tags.includes('window') && !pathConf.get) {
      pathConf.get = {}
    }

    const methodConfs = Object.values(pathConf).filter(conf => typeof conf === 'object')

    methodConfs.forEach(conf => {
      tags.forEach(tag => {
        if (!conf.tags) {
          conf.tags = [tag]
        } else if (!conf.tags.includes(tag)) {
          conf.tags.push(tag)
        }
      })
    })
  })

  return paths
}
