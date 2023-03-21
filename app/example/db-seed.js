// TODO: implement, currently needs save after initial sync
// TODO provide preload design doc api

export default [
  {
    _id: '_design/todos',

    options: {
      partitioned: false,
      where: 'both'
    },

    views: {
      // TODO: useme!
      conflicts: {
        map: function (doc) {
          if (doc._conflicts) {
            emit(doc._conflicts, null)
          }
        }.toString(),
        reduce: '_count'
      },
      by_completed_and_date: {
        map: function (doc) {
          if (doc.deleted || !doc.description) {
            return
          }
          emit([doc.completed, doc.date])
        }.toString(),
        reduce: '_count'
      },

      by_completed_and_description: {
        map: function (doc) {
          if (doc.deleted || !doc.description) {
            return
          }
          emit([doc.completed, doc.description])
        }.toString(),
        reduce: '_count'
      },

      by_date_and_description: {
        map: function (doc) {
          if (doc.deleted || !doc.description) {
            return
          }
          emit([doc.date, doc.description])
        }.toString(),
        reduce: '_count'
      }
    },
    changes: [ { userId: 'system', action: 'created', date: Date.now() } ]
  }
]
