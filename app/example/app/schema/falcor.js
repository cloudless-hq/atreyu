// TODO: move outer join ranges to ayu and fix ranges not collapsing properly
// console.log({ limit: to - from + 1, skip: from, from, to, ranges, rows: rows.map(row => row.key[0]) })

function viewMatch (view, sortBy) {
  if (view === 'all') {
    if (sortBy === 'date') {
      return { cView: 'by_date_and_description' }
    } else if (sortBy === 'completed') {
      return { cView: 'by_completed_and_date' }
    }
  } else {
    return {
      cView: 'by_completed_and_' + sortBy,
      endkey: view === 'active' ? [false] : [true],
      startkey: view === 'active' ? [false, {}] : [true, {}]
    }
  }
}

export default {
  'todos[{keys:view}][{keys:sortBy}].length': {
    get: {
      handler: async ({ dbs, view, sortBy }) => {
        const { cView, startkey, endkey } = viewMatch(view[0], sortBy[0])

        if (view.length > 1 || sortBy.length > 1) {
          console.error({view, sortBy})
        }
        const db = navigator.onLine ? dbs.couch : dbs.pouch

        const res = await db.query('todos/' + cView, {
          reduce: true,
          timeout: 2000,
          include_docs: false,
          descending: true,
          startkey,
          endkey
        }).catch(error => ({ error }))

        if (res.error) {
          console.log(res.error)
        }

        return {
          value: res.rows?.[0]?.value || 0
        }
      }
    }
  },

  'todos[{keys:view}][{keys:sortBy}][{ranges:ranges}]': {
    get: {
      handler: async ({ dbs, view, sortBy, ranges }) => {
        const { cView, startkey, endkey } = viewMatch(view[0], sortBy[0])
        if (view.length > 1 || sortBy.length > 1) {
          console.error({view, sortBy})
        }

        let to
        let from
        ranges.forEach(range => {
          if (to === undefined) {
            to = range.to
          } else {
            to = Math.max(to, range.to)
          }

          if (from === undefined) {
            from = range.from
          } else {
            from = Math.min(from, range.from)
          }
        })

        const db = navigator.onLine ? dbs.couch : dbs.pouch

        const { rows, error } = await db.query('todos/' + cView, {
          timeout: 2000,
          limit: to - from + 1,
          skip: from,
          include_docs: false,
          reduce: false,
          descending: true,
          startkey,
          endkey
        }).catch(error => ({ error }))

        if (error) {
          console.log(error)
        }

        return rows.map((row, i) => ({
          path: ['todos', view, sortBy, i + from],
          value: { $type: 'ref', value: ['_docs', row.id] }
        }))
      }
    }
  }
}
