export default {
  __ipfsPinningJWT: Deno.env.get('__IPFSPINNINGJWT'),

  _ELASTIC_AUTH: Deno.env.get('_ELASTIC_AUTH'),

  __cloudflareToken: Deno.env.get('__CLOUDFLARETOKEN'),

  _couchKey: Deno.env.get('_COUCHKEY'),
  _couchSecret: Deno.env.get('_COUCHSECRET'),

  __couchAdminKey: Deno.env.get('__COUCHADMINKEY'),
  __couchAdminSecret: Deno.env.get('__COUCHADMINSECRET')
}
