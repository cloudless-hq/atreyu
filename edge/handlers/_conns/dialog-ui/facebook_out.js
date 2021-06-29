export default function (input) {
  let out = input
  if (input.quick_replies) {
    input.quick_replies = input.quick_replies.map(quick_reply => {
      if (typeof quick_reply === 'string') {
        quick_reply = {
          title: quick_reply,
          content_type: 'text',
          payload: quick_reply
        }
      } else if (quick_reply.text) {
        quick_reply.content_type = 'text'
        quick_reply.payload = quick_reply.text
        if (!quick_reply.title) {
          quick_reply.title = quick_reply.text
        }
        delete quick_reply.text
      }
      return quick_reply
    })
  }

  if (input.buttons) {
    out = {
      'attachment': {
        'type': 'template',
        'payload': {
          template_type: 'button',
          text: input.text,
          buttons: input.buttons
            .filter(button => button.postback || (button.url && button.url.length > 4))
            .map(button => {
              if (button.url) {
                button.type = 'web_url'
              } else if (button.postback) {
                button.type = 'postback'
                button.payload = button.postback
                delete button.postback
              }
              return button
            })
        }
      }
    }
  }

  if (input.items) {
    out = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': input.items.map(item => {
            if (item.default_action && item.default_action.url) {
              item.default_action.type = 'web_url'
            } else if (item.default_action && item.default_action.postback) {
              item.default_action.type = 'postback'
              item.default_action.payload = button.postback
              delete item.default_action.postback
            }

            item.buttons = item.buttons
              .filter(button => button.postback || (button.url && button.url.length > 4))
              .map(button => {
                if (button.url) {
                  button.type = 'web_url'
                } else if (button.postback) {
                  button.type = 'postback'
                  button.payload = button.postback
                  delete button.postback
                }

                return button
              })
            return item
          })
        }
      }
    }
  }

  return out
}