export function extractFromCache ({ obj, path, idx = 0, root = obj, parentAtom }) { // verbose,
  // if (verbose) {
  //   console.log({ obj, path, idx })
  // }

  if (obj && obj.$type === 'atom' && path.length - idx !== 0) {
    const step = path[idx]
    if (obj.value === undefined) {
      return { value: undefined, parentAtom, $type: obj.$type }
    }
    return extractFromCache({ obj: obj.value[step], path, idx: idx + 1, root, parentAtom: { obj, relPath: path.slice(idx)} }) // verbose
  } else if (obj && obj.$type === 'ref') {
    const newPath = obj.value.concat(path.slice(idx))
    return extractFromCache({ obj: root, path: newPath }) // verbose
  } else if (path.length - idx === 0) {
    if (obj && obj.$type === 'error') {
      return { value: undefined, parentAtom, $type: obj.$type }
    } else if (obj && obj.$type) {
      return { value: obj.value, parentAtom, $type: obj.$type }
    } else {
      return { value: obj, parentAtom }
    }
  } else if (obj === null || obj === undefined) {
    return { value: obj, parentAtom }
  } else {
    const step = path[idx]
    return extractFromCache({ obj: obj[step], path, idx: idx + 1, root }) // verbose
  }
}

export function setPathValue (o, [head, ...tail], newValue, root) {
  if (!root) {
    o = structuredClone(o)
    root = o
  }
  if (tail.length) {
    if (!o[head]) {
      o[head] = {}
    }

    setPathValue(o[head], tail, newValue, root)
  } else {
    o[head] = newValue
    return root
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
