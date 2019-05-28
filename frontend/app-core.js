export const API_URL = 'https://api.glitch.com'

export const actions = {
  mounted: () => ({ type: 'app/mounted'})
}

actions.mounted.toString = () => 'app/mounted'
