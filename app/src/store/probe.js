import { writable, get } from '/_ayu/src/deps/svelte-store.js'

/**
 * From https://svelte.dev/repl/7be28cb8b6364f88bc5e441739fb3da8?version=3.24.0
 * A diagnostic utility that creates a `ReflectiveCounter` (a custom
 * store), suitable to be used in monitoring Svelte reflective counts.
 *
 * In it's rudimentary form, a `ReflectiveCounter` is just a simple
 * counter, however it's API is tailored to be used as a reflective
 * monitor.
 *
 * The `monitor()` method should be prefixed in a "Svelte invoked" JS
 * snippet (either through a logically-ORed expression, or a JS comma
 * operator).  It maintains a count of how often Svelte executes this
 * snippet.
 * EX: `<i>{fooProbe.monitor() || $foo}</i>`
 *
 * In an advanced usage pattern (in contrast to the logically-ORed
 * expression), the `monitor()` method may be passed a function as the
 * first parameter, which will be interpreted as the htmlSnippet,
 * maintaining two counters: the reflexive counts (html-snippet
 * executions) AND rerender counts (i.e. DOM updates).
 * EX: `<i>{fooProbe.monitor( () => $foo )}</i>`
 *
 * In turn these counts can be summarized directly on your page!
 * EX: `<mark>{$fooProbe}:</mark>`
 *
 * The `monitor()` method may also be optionally supplied a set of
 * `monitorDependents`.  This is used when the dependents you wish to
 * monitor are NOT already part of the production JS snippet.
 * Technically the utility does **not** use these items, rather it
 * merely informs Svelte to monitor these dependents as criteria for
 * re-invoking the snippet.
 * EX: `$: fooStateChangeCount.monitor($foo)`
 *
 * @param {string} id - the unique identifier of this ReflectiveCounter.
 * EX: `const fooProbe  = createReflectiveCounter('foo')`
 */

/* eslint-disable functional/no-this-expression, no-invalid-this */
export default function createReflectiveCounter (id) {
  if (!id) {
    throw new Error(`***ERROR** ReflectiveCounter id parameter is required`)
  }

  if (!isString(id)) {
    throw new Error(`***ERROR** ReflectiveCounter id parameter must be a string`)
  }

  // create our base writable store
  // ... -1 accounts for our initial monitor reflection (bumping it to 0)
  const { subscribe, set, update } = writable({ rflx: -1, rndr: -1, toString })

  // advanced usage state - true: monitor(htmlSnippetFn, ...monitorDependents), false: monitor(...monitorDependents)
  let advanced = undefined
  function setAdvanced (bool) {
    if (advanced === undefined) {
      advanced = bool
    }
    else if (advanced !== bool) {
      throw new Error(`***ERROR** ReflectiveCounter (id: ${id}) inconsistent usage of first param htmlSnippetFn`)
    }
  }

  // cache prior HTML value (used in advanced usage)
  let priorHtml = undefined

  // helper toString()
  function toString () {
    if (advanced) {
      return `${id}: {rflx: ${this.rflx}, rndr: ${this.rndr}}`
    } else {
      return `${id}: {rflx: ${this.rflx}}`
    }
  }

  // expose our newly created custom store
  return {
    subscribe,
    monitor (...monitorDependents) {
      // return value
      // ... default '' prevents rendering `undefined` on page (when used in isolation)
      //     still `falsy` when logically-ORed
      let rtn = ''

      // indicator as to whether a DOM re-render will occur
      let bumpRndr = false

      // advanced usage - monitor(htmlSnippetFn, ...monitorDependents)
      // ... when first param is a function, we return it's invocation as our htmlSnippet result
      if (isFunction(monitorDependents[0])) {
        setAdvanced(true)
        const htmlSnippetFn = monitorDependents[0]
        rtn = htmlSnippetFn()

        // determine if html has changed (indicating whether a DOM re-render will occur)
        // ... this heuristic is what svelte uses to determine when to re-render the DOM
        bumpRndr = rtn + '' !== priorHtml
        priorHtml = rtn + ''
      }
      // non-advanced usage - monitor(...monitorDependents)
      else {
        setAdvanced(false)
      }

      // increment our counts
      update( (counter) => ({
        rflx: counter.rflx + 1,
        rndr: bumpRndr ? counter.rndr + 1 : counter.rndr,
        toString
      }) )

      console.log(`ReflectiveCounter ${this}`)
      return rtn
    },

    reset () {
      set({rflx: 0, rndr: 0, toString})
    },

    toString () {
      const counter = get(this)
      return counter.toString()
    }
  }
}

function isString (ref) {
  return typeof ref === 'string' || ref instanceof String
}

function isFunction (ref) {
  return typeof ref === 'function'
}
/* eslint-enable functional/no-this-expression */
