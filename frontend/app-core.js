export const API_URL = 'https://api.glitch.com'

const okAndJSON = (res) => {
  if (!res.ok) throw new Error(res)
  return res.json()
}

export const api = {
  get: (path, { persistentToken } = {}) => 
    fetch(`${API_URL}${path}`, {
      mode: 'cors',
      headers: {
        'Authorization': persistentToken,
      }
    }).then(okAndJSON),
  post: (path, { body, persistentToken } = {}) => 
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      mode: 'cors',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Authorization': persistentToken,
      }
    }).then(okAndJSON),
  patch: (path, { body, persistentToken } = {}) => 
    fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      mode: 'cors',
      body: JSON.stringify(body),
      headers: {
        'Authorization': persistentToken,
      }
    }).then(okAndJSON),
  delete: (path, { persistentToken } = {}) => 
    fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Authorization': persistentToken,
      }
    }).then(okAndJSON),
}


export const actions = {
  mounted: () => ({ type: 'app/mounted'})
}

actions.mounted.toString = () => 'app/mounted'
