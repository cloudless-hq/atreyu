<script>
  import { makeProxy } from '/_ayu/src/lib/proxy-object.js'

  const proxy =  makeProxy({
    id: 'test',
    delims: ['$'],
    from: () => {},

    get: (path, subVal, delim, id) => {
      console.log('get', path)
    },
    set: (path, newValue, delim, id) => {
      console.log('set', path)
    },
    call: (path, args, delim, id) => {
      console.log('call', path)
    }
  })

  window.tp = proxy
</script>

<div class="m-10">
  tp.hi.world$<br><br>
  tp.hi.world = 'sdfsdf'<br><br>
  tp.hi.tsdf.d2342342f.map(elem => elem.test$)<br><br>
  tp.hi.tsdf.d2342342f.slice(0,10).map(elem => elem.test$)<br><br>
</div>