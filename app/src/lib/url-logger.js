export function urlLogger ({ missing, scope, method, url, origUrl, cached, corsConf, body, duration, res, richConsole = true }) {
  let badgeColor = ''

  if (richConsole) {
    badgeColor = 'grey'

    if (cached) {
      badgeColor = '#099009'
    } else if (cached === false) {
      badgeColor = 'orange'
    }

    if (method === 'POST' || method === 'SET' ) {
      badgeColor = 'rgb(170, 90, 217)'
    } else if (method === 'PUT') {
      badgeColor = 'rgb(174, 12, 226)'
    } else if (method === 'CALL') {
      badgeColor = 'rgb(236 124 248)'
    }
  }

  // TODO: move format url her : if (location) {
  //   url = url.replace(location.origin, '')
  //   // url = url.split('/').join('/ ')
  // }

  let displayUrl = ''
  try {
    if (typeof location !== 'undefined' && location.origin) { // TODO: deno --location <href> or Deno check
      displayUrl = url.replace(location.origin, '')
    } else {
      displayUrl = url
    }
  } catch (_e) {
    displayUrl = url
  }

  let edgeWorker = scope?.endsWith('edge-worker')

  /* eslint-disable no-console */
  if (richConsole) {
    console.groupCollapsed(
      `${(scope && edgeWorker) ? scope + ': ' : ''}%c${missing ? 'route error' : ''}%c${missing ? ' ' : ''}%c${method}%c %c ${displayUrl}`,
      richConsole && missing ? `background-color:red;border-radius:3px;color:black;font-weight:bold;padding-left:2px;padding-right:2px` : '',
      richConsole ? 'color:grey' : '',
      richConsole ? `background-color:${badgeColor};border-radius:3px;color:black;font-weight:bold;padding-left:2px;padding-right:2px` : '',
      richConsole ? 'color:grey' : '',
      richConsole ? 'color:grey' : ''
    )
  } else {
    console.log(`${(scope && edgeWorker) ? scope + ': ' : ''} ${missing ? 'route error' : ''} ${missing ? ' ' : ''} ${method}    ${displayUrl}`)
  }

  if (!edgeWorker && scope) {
    console.info(scope)
  }

  if (cached === true) {
    console.info('cache-status: hit')
  } else if (cached === false) {
    console.info('cache-status: miss')
  }

  if (origUrl && (url !== origUrl)) {
    console.info('rewritten from: ', origUrl)
  }

  if (corsConf && corsConf.mode === 'proxy') {
    console.info('proxied through: ' + corsConf.server)
  }

  if (typeof duration !== 'undefined') {
    console.log(`duration: ${duration}ms`)
  }

  if (body) {
    console.info(body)
  }

  if (richConsole) {
    console.groupEnd()
  }
  /* eslint-enable no-console */
}
