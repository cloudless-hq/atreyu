# atreyu

in folder root:

- install yarn (version support 1.22.10)

- yarn install

- yarn build to build node dependencies for deno

- remove the if case check process.env.FALCOR_OBSERVABLE_NO_CATCH from app/build/deps/falcor.js

- install ayu cli

  in checked out atreyu repo:
    deno install --allow-hrtime --allow-read --allow-env=DENO_DIR,HOME '--allow-net=127.0.0.1:5001,api.cloudflare.com,api.pinata.cloud' --allow-write="$TMPDIR","$HOME"/.atreyu,./ --allow-run=ipfs,`which deno`,yarn,rollup --no-check --prompt --unstable -n ayu -f /Users/jan/Dev/cloudless/atreyu/cli.js


- run dev daemon

  ayu start

- build and install atreyu to local dev server:

  ayu dev (just kill dev daemon after success message if not working on atreyu internals)