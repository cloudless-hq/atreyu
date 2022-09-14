
navigator.credentials.preventSilentAccess()

navigator.credentials.store((new PasswordCredential({
  id: 'devlocal_admin',
  data: 'sddfsdf',
  password: 'very long and secure admin password',
  name: 'Devlocal Admin',
  iconURL: `${location.origin}/assets/icon.png`
})))

const creds = await navigator.credentials.get({password: true, mediation: 'required'})

if (creds?.id) {
  if (location.origin.endsWith('localhost')) {
    setCookie('CF_Authorization', 'creds.id', 3)
  }
  location.href = '/'
}

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/verify