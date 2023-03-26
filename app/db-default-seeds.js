const userId = 'system'

export default [
  {
    _id: '_design/ayu_main_global',
    options: {
      partitioned: false
    },
    views: {
      conflicts: {
        map: function (doc) {
          if (doc._conflicts) {
            emit(doc._conflicts, null)
          }
        }.toString(),
        reduce: '_count'
      }
    },
    changes: [ { userId, action: 'created', date: Date.now() } ]
  },
  {
    _id: '_design/ayu_main',
    views: {
      by_type_and_title: {
        map: function (doc) {
          if (doc.deleted) {
            return
          }
          emit([doc.type, doc.title])
        }.toString(),
        reduce: '_count'
      }
    },
    changes: [ { userId, action: 'created', date: Date.now() } ]
  }
]
