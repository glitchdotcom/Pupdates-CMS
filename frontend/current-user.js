import { createSlice } from 'redux-starter-kit'
import { useSelector } from 'react-redux'
import { matchTypes, after } from './redux-aop'
import { api, actions as appActions, createSelectorWithHook } from './app-core'

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

const handlers = {
  [appActions.mounted]: async (store) => {
    const persistentToken = getFromStorage('persistentToken')
    if (!persistentToken) return store.dispatch(actions.loadedLoggedOutUser())
    try {
      const user = await getUserForPersistentToken(persistentToken)
      store.dispatch(actions.loadedLoggedInUser(user))
    } catch (e) {
      store.dispatch(actions.loadedLoggedOutUser())
    }
  },
  [actions.submittedEmail]: async (_, emailAddress) => {
    // sendLoginEmail is used for both sign in and sign up, 
    // and associates any projects created while anonymous with your email address
    // so it needs a persistentToken (even if, as in this case, we're not doing anything with it)    
    const { persistentToken } = await api.post('/users/anon')
    await api.post('/email/sendLoginEmail', {
      body: { emailAddress },
      persistentToken,
    })
  },
  [actions.submittedSignInCode]: async (store, code) => {
    const { persistentToken } = await api.post(`/auth/email/${code}`)
    const currentUser = await getUserForPersistentToken(persistentToken)
    setStorage('persistentToken', persistentToken)
    store.dispatch(actions.loadedLoggedInUser(currentUser))
  },
  [actions.loggedOut]: async () => {
    clearStorage('persistentToken')
  }
}

async function getUserForPersistentToken (persistentToken) {
  const data = await api.get(`/v1/users/by/persistentToken?persistentToken=${persistentToken}`)
  return {
    ...data.undefined,
    persistentToken,
  }
}

export { actions }

export const useLoggedInStatus = createSelectorWithHook(state => state.currentUser.status)
export const useCurrentUser = createSelectorWithHook(state => state.currentUser.currentUser)

export default { slice, reducer, handlers }
