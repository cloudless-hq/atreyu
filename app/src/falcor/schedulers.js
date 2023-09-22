const empty = {
  dispose: function () {}
}
function ImmediateScheduler () {}
ImmediateScheduler.prototype.schedule = function schedule (action) {
  action()
  return empty
}
ImmediateScheduler.prototype.scheduleWithState = function scheduleWithState (state, action) {
  action(this, state)
  return empty
}


function TimeoutScheduler (delay = 1) {
  this.delay = delay
}
const TimerDisposable = function TimerDisposable (id) {
  this.id = id
  this.disposed = false
}
TimeoutScheduler.prototype.schedule = function schedule (action) {
  const id = setTimeout(action, this.delay)
  return new TimerDisposable(id)
}
TimeoutScheduler.prototype.scheduleWithState = function scheduleWithState (state, action) {
  const self = this
  const id = setTimeout(function () {
    action(self, state)
  }, this.delay)

  return new TimerDisposable(id)
}
TimerDisposable.prototype.dispose = function () {
  if (this.disposed) {
    return
  }
  clearTimeout(this.id)
  this.disposed = true
}

/* eslint-disable functional/no-this-expression, functional/no-class */
class FrameScheduler {
  schedule (action) {
    let id = requestAnimationFrame(action)

    return {
      dispose: () => {
        if (id) {
          cancelAnimationFrame(id)
          id = null
        }
      }
    }
  }
  scheduleWithState (state, action) {
    const self = this
    let id = requestAnimationFrame(() => {
      action(self, state)
    })
    return {
      dispose: () => {
        if (id) {
          cancelAnimationFrame(id)
          id = null
        }
      }
    }
  }
}
/* eslint-enable functional/no-this-expression, functional/no-class */

export { ImmediateScheduler, TimeoutScheduler, FrameScheduler }

