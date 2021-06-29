export function toFalcorPaths (paths) {
  const methods = ['call', 'get', 'set']

  Object.entries(paths).forEach(([pathName, pathConf])=> {
    methods.forEach(method => {
      if (method in pathConf) {
        if (!pathConf[method].tags) {
          pathConf[method].tags = ['falcor']
        } else if (!pathConf[method].tags.includes('falcor')){
          pathConf[method].tags.push('falcor')
        }
      }
    })
  })

  return paths
}

export function toWindowPaths (paths) {
  Object.entries(paths).forEach(([pathName, pathConf]) => {
    if (!pathConf.get) {
      pathConf.get = {tags: [ 'window' ]}
    } else {
      pathConf.get.tags = [ 'window' ]
    }
  })

  return paths
}

export function normalize (path) {

}