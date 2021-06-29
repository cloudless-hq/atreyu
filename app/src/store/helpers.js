export function extractFromCache (obj, path, idx = 0, root = obj) {
  if (obj && obj.$type === 'atom' && path.length - idx !== 0) {
    let step = path[idx]
    if (!obj.value) {
      return undefined
    }
    return extractFromCache(obj.value[step], path, idx + 1, root)
  } else if (obj && obj.$type === 'ref') {
    let newPath = obj.value.concat(path.slice(idx))
    return extractFromCache(root, newPath)
  } else if (path.length - idx === 0) {
    if (obj && obj.$type === 'error') {
      return undefined
    } else if (obj && obj.$type) {
      return obj.value
    } else {
      return obj
    }
  } else if (obj === null || obj === undefined) {
    return obj
  } else {
    let step = path[idx]
    return extractFromCache(obj[step], path, idx + 1, root)
  }
}

export function diffCache (data, model, path = []) {
  let changes = []

  Object.entries(data).forEach(([key, newProp]) => {
    const subPath = [...path, key]
    const newVer = model.getVersion(subPath)

    const oldProp = ntr.app.get(pathString)

    if (typeof oldProp === 'undefined') {
      newProp.$_version = newVer
      changes.push([subPath, newProp])
    } else if (newVer === -1 || newVer !== oldProp.$_version) {
      if (newProp.$type === 'atom') {
        if (!(typeof newProp.value === 'undefined' && typeof oldProp.value === 'undefined')) {
          if (!newProp.value || !oldProp.value || !newProp.value._rev || newProp.value._rev !== oldProp.value._rev) {
            newProp.$_version = newVer
            changes.push([subPath, newProp])
          }
        }
      } else if (newProp.$type === 'ref') {
        if (!(newProp.value && oldProp.value && newProp.value[0] === 'byId' && newProp.value[1] === oldProp.value[1])) {
          newProp.$_version = newVer
          changes.push([subPath, newProp])
        }
      } else if (key === 'length') {
        if (newProp !== oldProp) {
          changes.push([subPath, newProp])
        }
      } else {
        changes = changes.concat(diffCache(newProp, model, subPath))
      }
    }
  })
  return changes
}