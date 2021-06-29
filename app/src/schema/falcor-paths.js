  // example working : )
  // 'test.pest': { // test if wildcard like path handling works
  //   get: {
  //     handler: async ({ pouch, titleRanges }) => {
  //       return [{ path: ['test', 'pest', 'x', 'y'], value: 1 }]
  //     }
  //   }
  // },
  // TODO migrate to box shorthand :  {$atom: somevalue}, {$ref: [1, 'b', 'd'}, {$error: 'error 1 occured'}

export default {
  '_sync': {
    call: {
      operationId: '_sync'
    }
  },
  '_hash': {
    get: {
      handler: () => {
        return {
          jsonGraph: {
            _hash: self.ipfsHash
          }
        }
      }
    }
  },
  '_updating': {
    get: {
      handler: () => {
        return {
          jsonGraph: {
            _updating: self.updating
          }
        }
      }
    },
    set: {
      handler: ({_updating}) => {
        self.updating = _updating

        return {
          jsonGraph: {
            _updating
          }
        }
      }
    }
  },
  '_docs.create': {
    call: {
      handler: async ({ pouch, userId, Observable }, [ docs ]) => {
        const result = await pouch.bulkDocs(docs)

        return result.map((doc, i) => {
          return { path: ['_docs', docs[i]._id], value: docs[i] } // { $type: 'atom', value:
        })
      }
    }
  },
  '_docs[{keys:ids}]': {
    set: {
      handler: async ({_docs, pouch, userId}) => {
        const result = await pouch.bulkDocs(Object.values(_docs).map(doc => doc.value))

        // todo: handle errors
        result.forEach(res => {
          if (res.ok) {
            _docs[res.id].value._rev = res.rev
          } else {
            console.error('set doc error', res)
          }
        })

        return  {
          jsonGraph: {
            _docs
          }
        }
      }
    },
    get: {
      handler: async ({ ids, keys, pouch }) => {
        const pouchRes = await pouch.allDocs({
          include_docs: true,
          keys: ids
        })
        // console.log(ids, pouchRes)
        const missingIds = []
        const _docs = {}

        pouchRes.rows.forEach(row => {
          if (row.error === 'not_found') {
            missingIds.push(row.key)
          } else if (!row.error) {
            if (row.doc) {

              _docs[row.key] = { $type: 'atom', value: row.doc }

              if (row.doc.types?.length === 1) {
                _docs[row.key].$schema = { $ref: row.doc.types[0].profile }
              } else if (row.doc.types?.length > 1) {
                _docs[row.key].$schema = { anyOf: _row.doc.types.map(type => {$ref: type.profile}) }
              }
            } else {
              console.error(row)
            }
          } else {
            console.error(row)
          }
        })

        // const res = {}
        // ids.forEach(id => {
        //   res[id] = {}
        //   keys.forEach(key => {
        //     res[id][key] = byId[id][key]
        //   })
        // })
        // return {
        //   jsonGraph: {
        //     byId: res
        //   }
        // }
        // const pouchRes = await pouch.allDocs({
        //     include_docs: true,
        //     keys: ids
        // })
        // const missingIds = []
        // const _docs = {}
        // pouchRes.rows.forEach(row => {
        // if (row.error === 'not_found') {
        //     missingIds.push(row.key)
        // } else if (!row.error) {
        //     if (row.doc) {
        //     _docs[row.key] = { $type: 'atom', value: row.doc }
        //     } else {
        //     console.error(row)
        //     }
        // } else {
        //     console.error(row)
        // }
        // })

        return {
          jsonGraph: {
            _docs
          }
        }
      }
    }
  }
}