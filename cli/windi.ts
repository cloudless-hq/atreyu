import { join, WindiProcessor, CSSParser } from '../deps-deno.ts' // HTMLParser, ClassParser

const windiClasses = new Set()
const windiProcessor = new WindiProcessor()

let windiConf
try {
  windiConf = (await import(join(Deno.cwd(), 'windi.config.js'))).default
} catch (_e) { }

windiProcessor.loadConfig(windiConf)

export function makeGlobalWindi (minify: boolean) {
  const APPEND = false
  const MINIFY = minify

  const resets = windiProcessor.preflight()

  let styles
  //   [...windiClasses].sort((a, b) => {
  //   console.log(a)
  //   const aPrefix = a.includes('\\:')
  //   const bPrefix = b.includes('\\:')
  //   if (aPrefix === bPrefix) {
  //     return b.localeCompare(a)
  //   } else if (aPrefix) {
  //     return -1
  //   } else if (bPrefix) {
  //     return 1
  //   }
  // }).reverse()
  windiClasses.forEach(batch => {
    const { styleSheet } = windiProcessor.interpret(batch) // , success, ignored
    if (!styles) {
      styles = styleSheet
    } else {
      styles = styles.extend(styleSheet, APPEND)
    }
  })
  styles = styles?.extend(resets, APPEND)

  // const ast = new ClassParser(htmlClasses).parse()

  return styles?.sort().build(MINIFY) || ''
}

export function collectWindiClasses (html: string) {
  let classes = []
  let directives = []

  // vendored in from https://github.com/windicss/svelte-windicss-preprocess >>
  // remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, '')

  // html =
  // html.replace(/([!\w][\w:_/-]*?):\(([\w\s/-]*?)\)/gm, (_, groupOne, groupTwo) =>
  //   console.log(groupOne, groupTwo) || groupTwo
  //     .split(/\s/g)
  //     .map(cssClass => `${groupOne}:${cssClass}`)
  //     .join(' ')
  // )

  const CLASS_MATCHES = [ ...html.matchAll(/class=(['"`])(?<classes>[^\1]+?)\1/gi) ]

  if (!(CLASS_MATCHES.length < 1)) {
    for (const match of CLASS_MATCHES) {
      const cleanMatch = match.groups?.classes
        .replace(/windi[`].+?[`]/gi, ' ') // windi`XYZ`
        .replace(/(?<![-])[$](?=[{])/gi, ' ') // if leading char is not -, and next char is {, then remove $
        .replace(/(?<=([{][\w\s]+[^{]*?))['"]/gi, ' ') // remove quotes in curly braces
        .replace(/(?<=([{][\w\s]+[^{]*?)\s)[:]/gi, ' ') // remove : in curly braces
        .replace(/([{][\w\s]+[^{]*?[?])/gi, ' ') // remove ? and condition in curly braces
        .replace(/[{}]/gi, ' ') // remove curly braces
        .replace(/\n/gi, ' ') // remove newline
        .replace(/ {2,}/gi, ' ') // remove multiple spaces
        .replace(/["'`]/gi, '') // remove quotes

      classes = classes.concat(
        (cleanMatch || '').split(' ').filter(c => {
          return c.length > 0
        })
      )
    }
  }

  const CURLY_CLASS_MATCHES = [ ...html.matchAll(/class=([{])(?<classes>[^}]+?)}/gi) ]

  if (!(CURLY_CLASS_MATCHES.length < 1)) {
    for (const match of CURLY_CLASS_MATCHES) {
      const cleanMatch = match.groups?.classes
        .replace(/windi[`].+?[`]/gi, ' ') // windi`XYZ`
        .replace(/(?<![-])[$](?=[{])/gi, ' ') // if leading char is not -, and next char is {, then remove $
        .replace(/(?<=([{][\w\s]+[^{]*?))['"]/gi, ' ') // remove quotes in curly braces
        .replace(/(?<=([{][\w\s]+[^{]*?)\s)[:]/gi, ' ') // remove : in curly braces
        .replace(/([{][\w\s]+[^{]*?[?])/gi, ' ') // remove ? and condition in curly braces
        .replace(/[{}]/gi, ' ') // remove curly braces
        .replace(/\n/gi, ' ') // remove newline
        .replace(/ {2,}/gi, ' ') // remove multiple spaces
        .replace(/["'`]/gi, '') // remove quotes

      classes = classes.concat(
        (cleanMatch || '').split(' ').filter(c => {
          return c.length > 0
        })
      )
    }
  }

  const DIRECTIVE_CLASS_MATCHES = [ ...html.matchAll(/\s(class):(?<class>[^=]+)(=)/gi) ]
  if (!(DIRECTIVE_CLASS_MATCHES.length < 1)) {
    for (const match of DIRECTIVE_CLASS_MATCHES) {
      directives = directives.concat(match[2])
    }
  }
  // << vendored in from svelte windi plugin

  [...directives, ...classes].forEach(klass => windiClasses.add(klass))
  // (new HTMLParser(html).parseClasses().map((i: any) => i.result)).forEach(windiClasses.add, windiClasses) // this does not support svelte syntax yet
}

export function windiParse (content: string) {
  const cssStyleSheet = new CSSParser(content, windiProcessor).parse()
  return cssStyleSheet?.build()
}
