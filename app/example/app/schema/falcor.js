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
  'todos[{keys:views}][{keys:sorts}].length': {
    get: {
      handler: ({ dbs, views, sorts }) => {
        const db = navigator.onLine && dbs.couch ? dbs.couch : dbs.pouch

        return Promise.all(views.map(async view => {
          const { cView, startkey, endkey } = viewMatch(view, sorts[0])

          if (sorts.length > 1) {
            console.error({view, sorts})
          }

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
            path: ['todos', view, sorts[0], 'length'],
            value: res.rows?.[0]?.value || 0
          }
        }))
      }
    }
  },

  'todos[{keys:views}][{keys:sorts}][{ranges:ranges}]': {
    get: {
      handler: ({ dbs, views, sorts, ranges }) => {
        // TODO: auto add db()
        const db = navigator.onLine && dbs.couch ? dbs.couch : dbs.pouch

        // TODO: auto add maxRange
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

        return Promise.all(views.map(async view => {
          const { cView, startkey, endkey } = viewMatch(view, sorts[0])

          if (sorts.length > 1) {
            console.error({view, sorts})
          }

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
            path: ['todos', view, sorts[0], i + from],
            value: { $type: 'ref', value: ['_docs', row.id] }
          }))
        })).then(res => res.flat())
        // TODO: auto flatten?
      }
    }
  }
}
