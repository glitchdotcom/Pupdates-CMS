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
      
      // TODO: populate indices
      
      if (request.relation) {
        state.relations[request.entity][request.relation] = { expires, value: Object.keys(response) }
        for (const key in response) {
          state.entities[request.relation][key] = { expires, value: response[key] }
        }
      } else {
        for (const key in response) {
          state.entities[request.entity][key] = { expires, value: response[key] }
        }
      }
    }
  }
})

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

// always returns { [id]: entity }, regardless of API type
async function getEntities ({ persistentToken, entity, idType, value, relation }) {
  if (relation) {
    const encoded = encodeURIComponent(value)
    const res = await fetch(`${API_URL}/${entity}/by/${idType}/${relation}?${idType}=${encoded}&limit=100`)
  }
}

const loading = { status: 'loading' }

const lookup = ({ entity, idType, value, relation }) => (state) => {
  const now = Date.now()
  const id = idType === 'id' ? value : state.index[getKey({ entity, idType, value })]
  if (!id) return loading
  
  if (relation) {
    const relation = state.relations[entity][relation][id]
    if (!relation) return loading
    const { expires, value: ids } = relation
    if (expires < now) return loading
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
