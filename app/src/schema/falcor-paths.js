// example working : )
// 'test.pest': { // test if wildcard like path handling works
//   get: {
//     handler: async ({ dbs, titleRanges }) => {
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

  '_users': {
    get: {
      handler: async ({ dbs, session: { org, userId } }) => {
        const { rows: sessions } = await dbs.couch.query(`ayu_main/by_type_and_title`, {
          partition: 'system',
          reduce: false,
          include_docs: true,
          startkey: [ 'session' ],
          endkey: ['session', {}]
        })

        const users = sessions.map(row => row.doc).sort((a, b) => b.lastLogin - a.lastLogin).reduce((agg, session) => {
          if (!agg[session.title]) {
            agg[session.title] = session
            agg[session.title].numSessions = 1
          } else {
            agg[session.title].numSessions += 1
          }
          return agg
        }, {})

        return {
          jsonGraph: {
            _users: { $type: 'atom', value: Object.values(users) }
          }
        }
      }
    }
  },

  '_sessions': {
    get: {
      handler: async ({ dbs, session: { org, userId } }) => {
        const sessionName = userId + (org ? ` (${org})` : '')

        const { rows: sessions } = await dbs.couch.query(`ayu_main/by_type_and_title`, {
          partition: 'system',
          reduce: false,
          include_docs: true,
          startkey: [ 'session', sessionName],
          endkey: ['session', sessionName, {}]
        })

        return {
          jsonGraph: {
            _sessions: { $type: 'atom', value: sessions.map(row => row.doc).sort((a, b) => b.lastLogin - a.lastLogin) }
          }
        }
      }
    }
  },

  '_pouch': {
    get: {
      handler: async ({ dbs }) => {
        return {
          jsonGraph: {
            _pouch: { $type: 'atom', value:  await dbs.pouch.info() }
          }
        }
      }
    }
  },
  '_couch': {
    get: {
      handler: async ({ dbs }) => {
        return {
          jsonGraph: {
            _couch: { $type: 'atom', value:  await dbs.couch?.info?.() }
          }
        }
      }
    }
  },

  // // fetch(`/_api/_couch/${loggedInDbName}/${session.sessionId}`)
  '_session[{keys:keys}]': {
    get: {
      handler: ({ _keys, session }) => {
        return {
          jsonGraph: {
            _session: session
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
  // '_changes.length': {
  //   get: {
  //     handler: async ({ dbs }) => {
  //       const pouchRes = await dbs.pouch.info()
  //       return { path: ['_changes', 'length'], value: pouchRes.update_seq }
  //     }
  //   }
  // },
  // '_changes': {
  //   get: {
  //     handler: ({ _ids, _keys, _dbs }) => {
  //       consoe.log('fixme')
  //       // const _pouchRes = await db.allDocs({
  //       //   include_docs: true,
  //       //   conflicts: true,
  //       //   keys: ids
  //       // })
  //     }
  //   }
  // },
  '_docs.create': {
    call: {
      handler: async ({ dbs, session, _Observable }, [ docs ]) => {
        if (!Array.isArray(docs)) {
          docs = [docs]
        }
        const result = await dbs.pouch.bulkDocs(docs.map(doc => {
          if (!doc._id) {
            // FIXME: uuid
            doc._id = `${Math.floor(Math.random() * 1000)}:${Math.floor(Math.random() * 1000000000)}`
          }
          doc.changes = [{ userId: session.userId, action: 'created', date: Date.now() }]
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
  //     handler: async ({ _docs, db, _userId, keys, ids }) => {
  //       console.log(_docs, keys, ids)
  //       const result = await db.bulkDocs(Object.values(_docs).map(({value}) => {
  //         if (!value.changes) {
  //           value.changes = []
  //         }
  //         if (value.deleted) {
  //           value.changes.push({ userId: session.userId, action: 'deleted',  date: Date.now() })
  //         } else if (!value._rev) {
  //           value.changes.push({ userId: session.userId, action: 'created',  date: Date.now() })
  //         } else {
  //           value.changes.push({ userId: session.userId, action: 'updated',  date: Date.now() })
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
  //     handler: async ({ ids, keys, db }) => {
  //       console.log( keys, ids)
  //       const pouchRes = await db.allDocs({
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
    get: {
      operationId: 'getDocs'
    },
    set: {
      handler: async ({ _docs, dbs, session }) => {
        const result = await dbs.pouch.bulkDocs(Object.values(_docs).map(({ value }) => {
          if (!value.changes) {
            value.changes = []
          }

          if (value.changes.length > 12) {
            value.changes.splice(2, value.changes.length - 4)
            value.changes.push({ userId: session.userId, action: 'aggregated', date: Date.now() })
          }

          if (value.deleted) {
            value.changes.push({ userId: session.userId, action: 'deleted', date: Date.now() })
          } else if (!value._rev) {
            value.changes.push({ userId: session.userId, action: 'created', date: Date.now() })
          } else {
            value.changes.push({ userId: session.userId, action: 'updated', date: Date.now() })
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
    }
  }
}
