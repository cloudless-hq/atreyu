# atreyu

in root of folder:

- requirements: yarn (version support 1.22.10), deno (), ipfs go cli ()

- yarn install && yarn build

  install and build node dependencies for deno

- install ayu cli:

  in checked out atreyu repo:
    deno install --allow-hrtime --allow-read --allow-env=DENO_DIR,HOME '--allow-net=127.0.0.1:5001,api.cloudflare.com,api.pinata.cloud' --allow-write="$TMPDIR","$HOME"/.atreyu,./,"$DENO_DIR"  --allow-run=ipfs,`which deno`,yarn,rollup --no-check --prompt --unstable -n ayu -f ./cli/mod.js

- currently prompts are not enabled automatically by deno install, if you want to be prompted, add the --prompt parameter to the script

  eg. code `which ayu`

- build and install atreyu to local dev server:

  ayu dev --start (just kill dev daemon after success message if not working on atreyu internals)