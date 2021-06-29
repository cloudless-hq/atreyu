import { JSONPath } from 'jsonpath-plus'
import templates from './tdocs'

function repl (tpl, json) {
  return tpl.replace(/{(.*?)}/g, (_, path) => {
    return JSONPath({preventEval: true, json, path}) || `"${path}"`
  })
}

export default async ({ templateName, context = {}, profile = {}, payload = {}, res = {} }) => {
  if (!templates[templateName]) {
    return
  }

  function expand (elems, item) {
    elems.forEach(elem => {
      if (elem.postback) {
        elem.postback = repl(elem.postback, { context, profile, payload, res, item })
      }
      if (elem.url) {
        elem.url = repl(elem.url, { context, profile, payload, res, item })
      }
      if (elem.title) {
        elem.title = repl(elem.title, { context, profile, payload, res, item })
      }
    })
  }

  const ts = JSON.parse(JSON.stringify(templates[templateName])) // todo: use docs and caching with clone !!

  ts.forEach(t => {
    if (t.text) {
      t.text = repl(t.text, { context, profile, payload, res })
    }

    if (t.buttons) {
      const path = t['buttons.items']
      if (path) {
        const templateString = JSON.stringify(t.buttons[0])

        t.buttons = JSONPath({preventEval: true, json: { context, profile, payload, res }, path}).map(item => {
          const itemTemplate = JSON.parse(templateString)
          expand([itemTemplate], item)
          return itemTemplate
        })

        delete t['buttons.items']
      } else {
        expand(t.buttons)
      }
    }

    if (t.items) {
      if (t.arrayMap && t.arrayMap[0].source) {
        const templateString = JSON.stringify(t.items[0])
        // TODO: handle array map target!

        t.items = JSONPath({preventEval: true, json: { context, profile, payload, res }, path: t.arrayMap[0].source}).map(item => {
          const elem = JSON.parse(templateString)

          if (elem.buttons) {
            expand(elem.buttons, item)
          }
          if (elem.title) {
            elem.title = repl(elem.title, { context, profile, payload, res, item })
          }
          if (elem.subtitle) {
            elem.subtitle = repl(elem.subtitle, { context, profile, payload, res, item })
          }
          if (elem.default_action) {
            expand([elem.default_action], item)
          }
          if (elem.image_url) {
            elem.image_url = repl(elem.image_url, { context, profile, payload, res, item })
          }

          return elem
        })

        delete t.arrayMap
      } else {
        t.items.forEach(elem => {
          if (elem.buttons) {
            expand(elem.buttons)
          }
          if (elem.title) {
            elem.title = repl(elem.title, { context, profile, payload, res })
          }
          if (elem.subtitle) {
            elem.subtitle = repl(elem.subtitle, { context, profile, payload, res })
          }
          if (elem.default_action) {
            expand([elem.default_action])
          }
          if (elem.image_url) {
            elem.image_url = repl(elem.image_url, { context, profile, payload, res })
          }
        })
      }
    }

    // if (t.quick_replies) {
    //   if (t.payload.facebook.text) {
    //     t.payload.facebook.text = repl(t.payload.facebook.text, { context, profile, payload, res })
    //   }
    //   if (t.payload.facebook.quick_replies) {
    //     if (t.payload.facebook['quick_replies.items']) {
    //       const path = t.payload.facebook['quick_replies.items']
    //       const templateString = JSON.stringify(t.payload.facebook.quick_replies[0])
    //       t.payload.facebook.quick_replies = JSONPath({preventEval: true, json: { context, profile, payload, res }, path}).map(item => {
    //         const itemTemplate = JSON.parse(templateString)
    //         expand([itemTemplate], item)
    //         return itemTemplate
    //       })
    //       delete t.payload.facebook['quick_replies.items']
    //     } else {
    //       expand(t.payload.facebook.quick_replies)
    //     }
    //   }
    //   t.quick_replies.title = repl(t.quick_replies.title, { context, profile, payload, res })
    //   t.quick_replies.quick_replies.forEach((reply, i) => {
    //     t.quick_replies.quick_replies[i] = repl(reply, { context, profile, payload, res })
    //   })
    // }
  })

  return ts
}