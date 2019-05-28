import { useEffect } from 'react'
import { createSlice } from 'redux-starter-kit'
import { useSelector, useDispatch } from 'react-redux'
import { after, matchTypes } from './redux-aop'
import { useCurrentUser } from './current-user'
import { API_URL } from './app-core';

const { slice, reducer, actions } = createSlice({
  slice: 'resources',
  initialState: {
    entities: {
      projects: {},
      users: {},
    },
    index: {},
    relations: {
      users: {
        projects: {},
      }
    },
    pendingRequests: {}
  },
  reducers: {
    requested: (state) => state,
    fetched: (state, { payload: request }) => ({
      ...state,
      pendingRequests: {
        ...state.pendingRequests,
        [getKey(request)]: true,
      }
    }),
    loaded: (state, { payload: { request, response } }) => {
      // using immer
      state.pendingRequests[getKey(request)] = undefined
      const expires = Date.now() + (1000 * 60 * 5)
      
      if (request.relation) {
        state.relations[request.entity][request.relation] = Object.keys(response)
        insertValues(state, response, request.relation, expires) 
      } else {
        insertValues(state, response, request.entity, expires) 
      }
    }
  }
})

// TODO: populate indices here
function insertValues (state, response, entity, expires) {
  for (const [id, value] of Object.entries(response)) {
    state.entities[entity][id] = { expires, value }
  }
}

const getKey = ({ entity, idType, value, relation }) => 
  [entity, idType, value, relation].filter(x => x).join('/')

const middleware = [
  after(matchTypes(actions.requested), async (store, { payload: request }) => {
    const state = store.getState()
    if (state.resources.pendingRequests[getKey(request)]) return
    const { persistentToken } = useCurrentUser.selector(state)
    
    const response = await getEntities({ persistentToken, ...request })
    store.dispatch(actions.loaded({ request, response }))
  })
]

const byID = (items) => items.reduce((obj, item) => {
  obj[item.id] = item
  return obj
}, {})

// always returns { [id]: entity }, regardless of API type
async function getEntities ({ persistentToken, entity, idType, value, relation }) {
  const params = {
    headers: {
      'Authorization': persistentToken,
    }
  }
  const encoded = encodeURIComponent(value)
  if (relation) {
    const res = await fetch(`${API_URL}/${entity}/by/${idType}/${relation}?${idType}=${encoded}&limit=100`, params)
    if (!res.ok) throw new Error('request failed')
    const { items } = await res.json()
    return byID(items)
  }
  const res = await fetch(`${API_URL}/${entity}/by/${idType}/${relation}?${idType}=${encoded}&limit=100`, params)
  if (!res.ok) throw new Error('request failed')
  const items = await res.json()
  return byID(Object.values(items))
}

const loading = { status: 'loading' }

const lookup = ({ entity, idType, value, relation }) => (state) => {
  const now = Date.now()
  const id = idType === 'id' ? value : state.index[getKey({ entity, idType, value })]
  if (!id) return loading
  
  if (relation) {
    const ids = state.relations[entity][relation][id]
    if (!ids) return loading
    const relationValues = []
    for (const itemID of ids) {
      const entity = state.entities[relation][itemID]
      if (!entity) return loading
      const { expires, value } = entity
      if (expires < now) return loading
      relationValues.push(value)
    }
    return { status: 'ready', value: relationValues }    
  }
  
  const entity = state.entities[relation][id]
  if (!entity || entity.expires < now) return loading
  return entity
}

export function useResource (entity, idType, value, relation) {
  const dispatch = useDispatch()
  const result = useSelector(lookup({ entity, idType, value, relation }))
  useEffect(() => {
    if (result.loading) {
      dispatch(actions.requested({ entity, idType, value, relation }))
    }
  }, [entity, idType, value, relation])
  
  return result
}

export default { slice, reducer, middleware }
