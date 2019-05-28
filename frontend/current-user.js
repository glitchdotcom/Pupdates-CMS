import { createSlice } from 'redux-starter-kit'
import { useSelector } from 'react-redux'
import { matchTypes, after } from './redux-aop'
import { API_URL, actions as appActions } from './app-core'

// localStorage

function getFromStorage (key, defaultValue) {
  const storedValue = localStorage.getItem(key)
  if (storedValue) return JSON.parse(storedValue)
  return defaultValue
}

function setStorage (key, newValue) {
  localStorage.setItem(key, JSON.stringify(newValue))
}

function clearStorage (key) {
  localStorage.removeItem(key)
}

const { slice, reducer, actions } = createSlice({
  slice: 'currentUser',
  initialState: {
    status: 'loading',
    currentUser: null,
  },
  reducers: {
    loadedLoggedInUser: (state, { payload }) => ({
      ...state,
      status: 'loggedIn',
      currentUser: payload,
    }),
    loadedLoggedOutUser: (state) => ({
      ...state,
      status: 'loggedOut',
      currentUser: null,
    }),
    submittedEmail: (state) => state,
    submittedSignInCode: (state) => ({ ...state, status: 'loading' }),
    loggedOut: (state) => ({ 
      ...state, 
      status: 'loggedOut',
      currentUser: null,
    }),
  },
})

const middleware = [
  after(matchTypes(appActions.mounted), async (store) => {
    const persistentToken = getFromStorage('persistentToken')
    try {
      const user = await getUserForPersistentToken(persistentToken)
      store.dispatch(actions.loadedLoggedInUser(user))
    } catch (e) {
      store.dispatch(actions.loadedLoggedOutUser())
    }
  }),
  after(matchTypes(actions.submittedEmail), async (_, { payload: emailAddress, onSuccess, onError }) => {
    // sendLoginEmail is used for both sign in and sign up, 
    // and associates any projects created while anonymous with your email address
    // so it needs a persistentToken (even if, as in this case, we're not doing anything with it)    
    const { persistentToken } = await fetch(`${API_URL}/users/anon`, { method: 'POST', mode: 'cors' }).then(res => res.json())
    const res = await fetch(`${API_URL}/email/sendLoginEmail`, { 
      method: 'POST', 
      body: JSON.stringify({ emailAddress }),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': persistentToken,
      },
    })
    if (res.ok && onSuccess) onSuccess(res)
    if (!res.ok && onError) onError(res)
  }),
  after(matchTypes(actions.submittedSignInCode), async (store, { payload: code }) => {
    const res = await fetch(`${API_URL}/auth/email/${code}`, { method: 'POST', mode: 'cors' })
    const { persistentToken } = await res.json()
    const currentUser = await getUserForPersistentToken(persistentToken)
    setStorage('persistentToken', persistentToken)
    store.dispatch(actions.loadedLoggedInUser(currentUser))
  }),
  after(matchTypes(actions.loggedOut), async () => {
    clearStorage('persistentToken')
  }),
]

async function getUserForPersistentToken (persistentToken) {
  if (!persistentToken) throw new Error("No token provided")
  const res = await fetch(`${API_URL}/v1/users/by/persistentToken?persistentToken=${persistentToken}`)
  if (!res.ok) throw new Error(res)
  const data = await res.json()
  return {
    ...data.undefined,
    persistentToken,
  }
}

export { actions }

// use hook in app code, use selector in middleware 
const createSelectorWithHook = (selector) => {
  const hook = () => useSelector(selector)
  hook.selector = selector
  return hook
}

export const useLoggedInStatus = createSelectorWithHook(state => state.currentUser.status)
export const useCurrentUser = createSelectorWithHook(state => state.currentUser.currentUser)

export default { slice, reducer, middleware }
