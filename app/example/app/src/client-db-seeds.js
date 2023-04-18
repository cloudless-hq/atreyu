export default [
  {
    _id: '_design/todos',

    options: {
      partitioned: false,
      include_design: true,
      where: 'both'
    },

    views: {
      // TODO: useme & move to system views!
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
          emit([doc.completed, doc.date, doc._id])
        }.toString(),
        reduce: '_count'
      },

      by_completed_and_description: {
        map: function (doc) {
          if (doc.deleted || !doc.description) {
            return
          }
          emit([doc.completed, doc.description, doc._id])
        }.toString(),
        reduce: '_count'
      },

      by_date_and_description: {
        map: function (doc) {
          if (doc.deleted || !doc.description) {
            return
          }
          emit([doc.date, doc.description, doc._id])
        }.toString(),
        reduce: '_count'
      }
    },
    changes: [ { userId: 'system', action: 'created', date: Date.now() } ]
  }
]
