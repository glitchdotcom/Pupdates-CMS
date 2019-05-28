import { useSelector } from 'react-redux'
export const API_URL = 'https://api.glitch.com'

const okAndJSON = (res) => {
  if (!res.ok) throw new Error(res)
  return res.json()
}

const headers = ({ body, persistentToken }) => ({
  ...(body ? { 'Content-Type': 'application/json' } : {}),
  ...(persistentToken ? { 'Authorization': persistentToken } : {}),
})

export const api = {
  get: (path, { persistentToken } = {}) => 
    fetch(`${API_URL}${path}`, {
      mode: 'cors',
      headers: headers({ persistentToken }),
    }).then(okAndJSON),
  post: (path, { body, persistentToken } = {}) => 
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      mode: 'cors',
      body: body ? JSON.stringify(body) : undefined,
      headers: headers({ body, persistentToken }),
    }).then(okAndJSON),
  patch: (path, { body, persistentToken } = {}) => 
    fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      mode: 'cors',
      body: JSON.stringify(body),
      headers: headers({ body, persistentToken }),
    }).then(okAndJSON),
  delete: (path, { persistentToken } = {}) => 
    fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: headers({ persistentToken }),
    }).then(okAndJSON),
}


export const actions = {
  mounted: () => ({ type: 'app/mounted'})
}

actions.mounted.toString = () => 'app/mounted'

// use hook in app code, use selector in middleware 
export const createSelectorWithHook = (selector) => {
  const hook = () => useSelector(selector)
  hook.selector = selector
  return hook
}