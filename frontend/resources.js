import { useEffect } from 'react'
import { createSlice } from 'redux-starter-kit'
import { useSelector, useDispatch } from 'react-redux'
import { after, matchTypes } from './redux-aop'
import { useCurrentUser } from './current-user'
import { API_URL } from './app-core'

const resourceConfig = {
  collections: {
    secondaryKeys: ['fullUrl'],
    references: { projects: 'projects' },
  },
  projects: {
    secondaryKeys: ['domain'],
    references: { collections: 'collections', teams: 'teams', users: 'users' },
  },
  teams: {
    secondaryKeys: ['url'],
    references: { 
      collections: 'collections', 
      users: 'users', 
      projects: 'projects', 
      pinnedProjects: 'projects' 
    },
  },
  users: {
    secondaryKeys: ['login'],
    references: { 
      collections: 'collections', 
      teams: 'teams', 
      projects: 'projects', 
      pinnedProjects: 'projects',
      deletedProjects: 'projects',
    },
  },
}

function createInitialState (config) {
  const entities = {}
  const indices = {}
  for (const [entityName, {secondaryKeys, references}] of Object.entries(config)) {
    entities[entityName] = {}
    indices[entityName] = {}
    for (const secondaryKey of secondaryKeys) {
      indices[entityName][secondaryKey] = {}
    }
    for (const reference of Object.keys(references)) {
      indices[entityName][reference] = {}
    }
  }
  return { entities, indices }
}

const { slice, reducer, actions } = createSlice({
  slice: 'resources',
  initialState: {
    ...createInitialState(resourceConfig),
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
        // TODO: what if this is missing?
        const id = request.idType === 'id' ? request.value : state.indices[request.entity][request.idType][request.value]
        state.indices[request.entity][request.relation][id] = Object.keys(response)
        const referencedEntity = resourceConfig[request.entity].references[request.relation]
        insertValues(state, response, referencedEntity, expires) 
      } else {
        insertValues(state, response, request.entity, expires) 
      }
    },
    deleted: (state, { payload: { entity, id } }) => {
      state.entities[entity][id] = undefined
    },
    restartedProject: (state) => state,
  }
})

function insertValues (state, response, entity, expires) {
  for (const [id, value] of Object.entries(response)) {
    // populate indices
    for (const secondaryKey of resourceConfig[entity].secondaryKeys) {
      state.indices[entity][secondaryKey][value[secondaryKey]] = value.id
    }
    // populate actual data
    state.entities[entity][id] = { expires, value }
  }
}

const getKey = ({ entity, idType, value, relation }) => 
  [entity, idType, value, relation].filter(x => x).join('/')

const middleware = [
  after(matchTypes(actions.requested), async (store, { payload: request }) => {
    if (store.getState().resources.pendingRequests[getKey(request)]) return
    store.dispatch(actions.fetched(request))

    const { persistentToken } = useCurrentUser.selector(store.getState())
    const response = await getEntities({ persistentToken, ...request })
    store.dispatch(actions.loaded({ request, response }))
  }),
  after(matchTypes(actions.deleted), (store, { payload: { entity, id } }) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    fetch(`${API_URL}/${entity}/${id}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Authorization': persistentToken,
      }
    })
  }),
  after(matchTypes(actions.restartedProject), (store, { payload: id }) => {
    const project = store.getState().resources.entities.projects[id]
    const { persistentToken } = useCurrentUser.selector(store.getState())
    fetch(`${API_URL}/projects/${project.domain}/stop`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Authorization': persistentToken,
      }
    })
  })
]

const byID = (items) => items.reduce((obj, item) => {
  obj[item.id] = item
  return obj
}, {})

// always returns { [id]: entity }, regardless of API type
async function getEntities ({ persistentToken, entity, idType, value, relation }) {
  const params = {
    mode: 'cors',
    headers: {
      'Authorization': persistentToken,
    }
  }
  const encoded = encodeURIComponent(value)
  if (relation) {
    const res = await fetch(
      `${API_URL}/v1/${entity}/by/${idType}/${relation}?${idType}=${encoded}&limit=100&orderDirection=DESC`, 
      params)
    if (!res.ok) throw new Error('request failed')
    const { items } = await res.json()
    return byID(items)
  }
  const res = await fetch(`${API_URL}/v1/${entity}/by/${idType}/${relation}?${idType}=${encoded}`, params)
  if (!res.ok) throw new Error('request failed')
  const items = await res.json()
  return byID(Object.values(items))
}

const loading = { status: 'loading' }

const lookup = ({ entity, idType, value, relation }) => (state) => {
  const now = Date.now()
  const id = idType === 'id' ? value : state.resources.indices[entity][idType][value]
  if (!id) return loading
  
  if (relation) {
    const ids = state.resources.indices[entity][relation][id]
    if (!ids) return loading
    const relationValues = []
    const referencedEntityType = resourceConfig[entity].references[relation]
    for (const itemID of ids) {
      const result = state.resources.entities[referencedEntityType][itemID]
      if (!result) continue
      if (result.expires < now) return loading
      relationValues.push(result.value)
    }
    return { status: 'ready', value: relationValues }    
  }
  
  const result = state.resources.entities[relation][id]
  if (!result || result.expires < now) return loading
  return result
}

export function useResource (entity, idType, value, relation) {
  const dispatch = useDispatch()
  const result = useSelector(lookup({ entity, idType, value, relation }))
  useEffect(() => {
    if (result.status === 'loading') {
      dispatch(actions.requested({ entity, idType, value, relation }))
    }
  }, [result.status, entity, idType, value, relation])
  
  return result
}

export { actions }

export default { slice, reducer, middleware }
