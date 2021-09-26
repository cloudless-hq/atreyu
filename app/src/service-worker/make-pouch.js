import Pouchdb from '../../build/deps/pouchdb.js'

// import findPlugin from 'Pouchdb-find'
// import allDbs from 'Pouchdb-all-dbs'
// allDbs(PouchDB)
// PouchDB.plugin(findPlugin)
// import debugPlugin from 'Pouchdb-debug'
// PouchDB.plugin(debugPlugin)
// PouchDB.debug.enable('*')

export default function ({
  dbName,
  designDocs
}) {

  // TODO support schema based configuration and direct client couch connection with cors support
  // couchHost ? `https://${couchKey}:${couchSecret}@${couchHost}` : `${location.origin}`
  // ${couchRoot ? couchRoot : '/'}$

  const pouch = new Pouchdb(dbName)

  if (designDocs && designDocs.length > 0) {
    pouch.bulkDocs(designDocs)
      .catch(err => {
        if (err.name !== 'conflict') {
          console.log(err)
        }
      })
    // .finally(() => {
    //   startSync()
    // })
  }
  //  else {
  //   startSync()
  // }

  // function startSync () {
  // TODO: move to application logic or make configurable with different strategies
  // [admin ? 'sync' : 'replicate']

  const proxyUrl = `${location.origin}/_couch/${dbName}`

  const sync = Pouchdb.sync(proxyUrl, dbName, {
    live: true,
    retry: true,
    heartbeat: 2500,
    filter: doc => {
      return !doc._id.startsWith('_design/client')
    }
    // checkpoint: false source target
  })
    .on('denied', err => {
      onsole.error('denied', err)
      // a document failed to replicate (e.g. due to permissions)
    })
    .on('error', err => {
      console.error(err)
      // debugger; TODO put in error handler globally?
    })

  // .on('change', info => {
  //   console.log(info)
  // }).on('paused', () => {
  //   // replication paused (e.g. replication up to date, user went offline)
  // }).on('active', () => {
  //   // replicate resumed (e.g. new changes replicating, user went back online)
  // })..on('complete', info => {
  //   // console.log(info)
  // })
  // }
  // pouch.info().then(info => {
  //   // TODO: this leads to replay of all changes since worker started on new clients for running worker
  //   pouch._startSeq = info.update_seq
  // })
  pouch.ayuSync = sync

  return pouch
}
