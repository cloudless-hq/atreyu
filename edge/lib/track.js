/* global fetch, Headers, btoa, MIXPANEL_TOKEN */
export default function ({ req, stats }) {

  const adNetwork = req.url.searchParams.get('utm_medium')
  let adSource = ''
  let adGroup = ''

  if (adNetwork) {
    adSource = adNetwork
    adGroup = req.url.searchParams.get('utm_source')
  } else {
    adSource = req.url.searchParams.get('utm_source')
  }

  const campaign = req.url.searchParams.get('utm_campaign')
  const searchTerm = req.url.searchParams.get('utm_term')
  const adId = req.url.searchParams.get('utm_content')

  const event = {
    event: 'load',
    properties: {
      token: '<MIXPANEL_TOKEN>',
      $current_url: req.url.href,
      url: req.url.href,
      ip: req.headers['cf-connecting-ip'],
      user_agent: req.headers['user-agent'],
      $insert_id: stats.traceId,
      country: stats.cf.country,
      colo: stats.cf.colo,
      traceId: stats.traceId,
      adSource,
      adGroup,
      campaign,
      searchTerm,
      adId,
      adNetwork
      // A random 16 character string of alphanumeric characters that is unique to an event. $insert_id can contain less than 16 characters, but any string longer than 16 characters will be truncated. Mixpanel replaces $insert_id if the value passed contains non-alphanumeric characters.

      // distinct_id: ''
      // The value of distinct_id will be treated as a string, and used to uniquely identify a user associated with your event. If you provide a distinct_id property with your events, you can track a given user through funnels and distinguish unique users for retention analyses. You should always send the same distinct_id when an event is triggered by the same user.

      // time
      // The time an event occurred. If present, the value should be a unix timestamp (seconds since midnight, January 1st, 1970 - UTC). If this property is not included in your request, Mixpanel will use the time the event arrives at the server.
    }
  }

  const url = `https://api.mixpanel.com/track/?data=${btoa(JSON.stringify(event))}`
  return fetch(url)
}
