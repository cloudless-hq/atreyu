# atreyu

in folder root:

- yarn install
- yarn build to build node dependencies for deno
- remove the if case check process.env.FALCOR_OBSERVABLE_NO_CATCH from app/build/deps/falcor.js

- install ayu cli
- run dev daemon
  ayu start
- build and install atreyu to local dev server:
  ayu dev (just kill dev daemon after success message if not working on atreyu internals)