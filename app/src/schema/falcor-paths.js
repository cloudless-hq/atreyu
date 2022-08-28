// example working : )
// 'test.pest': { // test if wildcard like path handling works
//   get: {
//     handler: async ({ dbs, titleRanges }) => {
//       return [{ path: ['test', 'pest', 'x', 'y'], value: 1 }]
//     }
//   }
// },
// TODO migrate to box shorthand :  {$atom: somevalue}, {$ref: [1, 'b', 'd'}, {$error: 'error 1 occured'}

function userDb (dbs) {
  // just get first db at the moment
  return dbs.entries().next().value?.[1]
}

export default {
  '_sync': {
    call: {
      operationId: '_sync'
    }
  },

  '_session[{keys:keys}]': {
    get: {
      handler: ({ _keys }) => {
        return {
          jsonGraph: {
            _session: self.session.value
          }
        }
      }
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
  '_changes.length': {
    get: {
      handler: async ({ dbs }) => {
        const pouchRes = await userDb(dbs).info()
        return { path: ['_changes', 'length'], value: pouchRes.update_seq }
      }
    }
  },
  '_changes': {
    get: {
      handler: async ({ ids, _keys, dbs }) => {
        const _pouchRes = await userDb(dbs).allDocs({
          include_docs: true,
          conflicts: true,
          keys: ids
        })
      }
    }
  },
  '_docs.create': {
    call: {
      handler: async ({ dbs, _userId, _Observable }, [ docs ]) => {
        const result = await userDb(dbs).bulkDocs(docs.map(doc => {
          doc.changes = [{ userId: session.value.userId, action: 'created', date: Date.now() }]
          return doc
        }))

        return result.map((_doc, i) => {
          return { path: ['_docs', docs[i]._id], value: docs[i] } // { $type: 'atom', value:
        })
      }
    }
  },
  // this route handles subkey upsert and subset key requests
  // '_docs[{keys:ids}][{keys:keys}]': {
  //   set: {
  //     handler: async ({ _docs, dbs, _userId, keys, ids }) => {
  //       console.log(_docs, keys, ids)
  //       const result = await userDb(dbs).bulkDocs(Object.values(_docs).map(({value}) => {
  //         if (!value.changes) {
  //           value.changes = []
  //         }
  //         if (value.deleted) {
  //           value.changes.push({ userId: session.value.userId, action: 'deleted',  date: Date.now() })
  //         } else if (!value._rev) {
  //           value.changes.push({ userId: session.value.userId, action: 'created',  date: Date.now() })
  //         } else {
  //           value.changes.push({ userId: session.value.userId, action: 'updated',  date: Date.now() })
  //         }
  //         return value
  //       }))
  //       result.forEach(res => {
  //         if (res.ok) {
  //           _docs[res.id].value._rev = res.rev
  //         } else {
  //           console.error('set doc error', res)
  //         }
  //       })
  //       return  {
  //         jsonGraph: {
  //           _docs
  //         }
  //       }
  //     }
  //   },
  //   get: {
  //     handler: async ({ ids, keys, dbs }) => {
  //       console.log( keys, ids)
  //       const pouchRes = await userDb(dbs).allDocs({
  //         include_docs: true,
  //         conflicts: true,
  //         keys: ids
  //       })
  //       // console.log(ids, pouchRes)
  //       const missingIds = []
  //       const _docs = {}
  //       pouchRes.rows.forEach(row => {
  //         if (row.error === 'not_found') {
  //           missingIds.push(row.key)
  //         } else if (!row.error) {
  //           if (row.doc) {
  //             _docs[row.key] = { $type: 'atom', value: row.doc }
  //             if (row.doc.type) {
  //               _docs[row.key].$schema = { $ref: row.doc.type }
  //             } else if (row.doc.types?.length === 1) {
  //               _docs[row.key].$schema = { $ref: row.doc.types[0].profile }
  //             } else if (row.doc.types?.length > 1) {
  //               _docs[row.key].$schema = { anyOf: _row.doc.types.map(type => {$ref: type.profile}) }
  //             }
  //           } else {
  //             console.warn(row)
  //           }
  //         } else {
  //           console.error(row)
  //         }
  //       })
  //       return {
  //         jsonGraph: {
  //           _docs
  //         }
  //       }
  //     }
  //   }
  // },
  '_docs[{keys:ids}]': {
    set: {
      handler: async ({ _docs, dbs, _userId }) => {
        const result = await userDb(dbs).bulkDocs(Object.values(_docs).map(({ value }) => {
          if (!value.changes) {
            value.changes = []
          }

          if (value.changes.length > 12) {
            value.changes.splice(2, value.changes.length - 4)
            value.changes.push({ userId: session.value.userId, action: 'aggregated', date: Date.now() })
          }

          if (value.deleted) {
            value.changes.push({ userId: session.value.userId, action: 'deleted', date: Date.now() })
          } else if (!value._rev) {
            value.changes.push({ userId: session.value.userId, action: 'created', date: Date.now() })
          } else {
            value.changes.push({ userId: session.value.userId, action: 'updated', date: Date.now() })
          }

          return value
        }))

        // todo: handle errors
        result.forEach(res => {
          if (res.ok) {
            _docs[res.id].value._rev = res.rev
          } else {
            console.error('set doc error', res)
          }
        })

        return {
          jsonGraph: {
            _docs
          }
        }
      }
    },
    get: { // -> get: getDocs,
      handler: async ({ ids, _keys, dbs }) => {
        const pouchRes = await userDb(dbs)?.allDocs({
          include_docs: true,
          conflicts: true,
          keys: ids
        }) || {rows:[]}

        const missingIds = []
        const _docs = {}

        pouchRes.rows.forEach(row => {
          if (row.error === 'not_found') {
            missingIds.push(row.key)
          } else if (!row.error) {
            if (row.doc) {

              _docs[row.key] = { $type: 'atom', value: row.doc }

              if (row.doc.type) {
                _docs[row.key].$schema = { $ref: row.doc.type }
              } else if (row.doc.types?.length === 1) {
                _docs[row.key].$schema = { $ref: row.doc.types[0].profile }
              } else if (row.doc.types?.length > 1) {
                _docs[row.key].$schema = { anyOf: _row.doc.types.map(type => ({ '$ref': type.profile })) }
              }
            } else {
              console.warn(row)
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
        // const pouchRes = await userDb(dbs).allDocs({
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
