import { join, WindiProcessor, HTMLParser, CSSParser } from '../deps-deno.ts'

const windiClasses = new Set()
const windiProcessor = new WindiProcessor()

let windiConf
try {
  windiConf = (await import(join(Deno.cwd(), 'windi.config.js'))).default
} catch (_e) { }

windiProcessor.loadConfig(windiConf)

export function makeGlobalWindi (minify: boolean) {
  // console.log(windiClasses.size)
  const htmlClasses = [...windiClasses].sort().join(' ')
  const resets = windiProcessor.preflight()
  const interpretedSheet = windiProcessor.interpret(htmlClasses).styleSheet
  // console.log(interpretedSheet.build().length)

  const APPEND = false
  const MINIFY = minify
  const styles = interpretedSheet.extend(resets, APPEND).build(MINIFY)
  // console.log(styles.length)
  return styles
}

export function collectWindiClasses (html: string) {
  (new HTMLParser(html).parseClasses().map((i: any) => i.result)).forEach(windiClasses.add, windiClasses)
}

export function windiParse (content: string) {
  const cssStyleSheet = new CSSParser(content, windiProcessor).parse()
  return cssStyleSheet?.build()
}
