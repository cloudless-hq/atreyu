// TODO: move outer join ranges to ayu and fix ranges not collapsing properly
// console.log({ limit: to - from + 1, skip: from, from, to, ranges, rows: rows.map(row => row.key[0]) })
// import { getDocs } from '/_ayu/src/schema/falcor-handlers/index.js'

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

async function getDocs ({ ids, dbs, req, existing }) {
  const pouchRes = await dbs.pouch.allDocs({
    include_docs: false, conflicts: false,
    keys: ids.filter(id => id && !existing.includes(id))
  })

  const missingIds = []
  pouchRes?.rows?.forEach(row => {
    if (row.error || !row.value) {
      if (row.error !== 'not_found') {
        console.error(row)
      }

      missingIds.push(row.key)
    }
  })

  if (missingIds.length > 0) {
    const { json: freshDocs } = await req(dbs.couch.name + '/_all_docs?include_docs=true&attachments=true', { // include conflicts
      body: { 'keys': missingIds }
    })
    // event.waitUntil(
    freshDocs?.rows?.length && dbs.pouch.bulkDocs(freshDocs.rows.map(row => row.doc).filter(exists => exists), {
      new_edits: false
    })
    // )
  }
}

export default {
  'todos[{keys:views}][{keys:sorts}].length': {
    get: {
      handler: ({ dbs: { pouch, couch }, views, sorts, req }) => {
        function query (db, startkey, endkey, cView) {
          return db.query('todos/' + cView, {
            reduce: true,
            timeout: 2000,
            include_docs: false,
            descending: true,
            startkey,
            endkey
            // TODO: optional sync in sideeffect and delay option
          }).catch(error => ({ error }))
        }

        return Promise.all(views.map(async view => {
          const { cView, startkey, endkey } = viewMatch(view, sorts[0])

          const countPath = `todos.${view}.${sorts[0]}.length`

          const countId = `count_${countPath}`
          if (sorts.length > 1) {
            console.error({view, sorts}) // sorts: ['completed', 'date'] view: "all"
          }

          const res = await query(pouch, startkey, endkey, cView)
          const pouchCount = res.rows?.[0]?.value || 0
          let localCouchCount = 0

          if (navigator.onLine && couch) {
            const localCouchCountDoc = await pouch.get(countId).catch(error => ({error}))
            localCouchCount = localCouchCountDoc?.value || 0

            query(couch, startkey, endkey, cView).then(couchRes => {
              const couchCount = couchRes.rows?.[0]?.value

              console.log({ couchCount, pouchCount, localCouchCountDoc, countId })

              if (localCouchCountDoc.value !== couchCount) {
                // console.log('updating local couch count doc', { _id: countId, value: couchCount, _rev: localCouchCountDoc._rev })
                pouch.put({ _id: countId, type: 'system:counter', value: couchCount, path: countPath,  _rev: localCouchCountDoc._rev }).catch(error => console.error({error}))
              }
            })
          }

          if (res.error) {
            console.error(res.error)
          }

          return {
            path: ['todos', view, sorts[0], 'length'],
            value: Math.max(localCouchCount || pouchCount) //  === undefined ? { $type: 'error', value: res.error } : res.rows?.[0]?.value
          }
        }))
      }
    }
  },

  'todos[{keys:views}][{keys:sorts}][{ranges:ranges}]': {
    get: {
      handler: ({ dbs: { couch, pouch}, views, sorts, ranges, req, model, maxRange }) => {
        const { from, to } = maxRange(ranges)

        function query (db, cView, startkey, endkey, to, from, skip) {
          return db.query('todos/' + cView, {
            timeout: 2000,
            limit: to - from + 1,
            skip,
            include_docs: false,
            reduce: false,
            descending: true,
            startkey,
            endkey
          }).catch(error => ({ error }))
        }

        return Promise.all(views.map(async view => {
          const { cView, startkey, endkey } = viewMatch(view, sorts[0])

          if (sorts.length > 1) {
            console.error({view, sorts}) // sorts: ['completed', 'date'] view: "all"
          }

          const { index, pageKey } = model.getPageKey(['todos', view, sorts[0]], from)

          const skip = from - index
          // FIXME: never skip but use unpaged entries to validate model consistency?!

          const { rows, error } = await query(pouch, cView, pageKey || startkey, endkey, to, from, skip)

          // console.log({ index, startkey, pageKey, rows, from, to, skip, limit: to - from + 1 })


          if (navigator.onLine && couch) {
            query(couch, cView, pageKey || startkey, endkey, to, from, skip).then(({ rows: couchRows }) => {
              getDocs({ ids: couchRows.map(({id}) => id), dbs: { pouch, couch }, req, existing: rows.map(({id}) => id) })
            })
          }

          if (error) {
            console.log(error)
          }

          // console.log(rows)
          const emptyEntries = []
          for (let end = rows?.length + from ; end <= to; end++ ) {
            // console.log({rows: rows?.length, from, to, end} )
            emptyEntries.push({
              path: ['todos', view, sorts[0], end],
              value: { $type: 'atom', $expires: -2 }
            })
          }

          return rows?.map((row, i) => ({
            path: ['todos', view, sorts[0], i + from],
            value: { $type: 'ref', value: ['_docs', row.id], $pageKey: row.key }
          })).concat(emptyEntries) || emptyEntries
        })).then(res => res.flat())
        // TODO: auto flatten?
      }
    }
  }
}
