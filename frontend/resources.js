import { useEffect } from 'react'
import { createSlice } from 'redux-starter-kit'
import { useSelector, useDispatch } from 'react-redux'
import { useCurrentUser } from './current-user'
import { api } from './app-core'

// TODO: do this datalog-style, with entity-attribute-value schema
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
    swappedProjects: (state) => state,
    remixedProjectAsTeam: (state) => state,
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

const handlers = {
  [actions.requested]: async (store, request) => {
    if (store.getState().resources.pendingRequests[getKey(request)]) return
    store.dispatch(actions.fetched(request))

    const { persistentToken } = useCurrentUser.selector(store.getState())
    const response = await getEntities({ persistentToken, ...request })
    store.dispatch(actions.loaded({ request, response }))
  },
  [actions.deleted]: async (store, { entity, id }) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    await api.delete(`/${entity}/${id}`, { persistentToken })
  },
  [actions.restartedProject]: async (store, id) => {
    const project = store.getState().resources.entities.projects[id]
    const { persistentToken } = useCurrentUser.selector(store.getState())
    await api.post(`/projects/${project.domain}/stop`, { persistentToken })
  },
  [actions.swappedProjects]: async (store, { source, target }) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    await api.post(`/projects/swapDomains?source=${source}&target=${target}&authorization=${persistentToken}`)
  },
  [actions.remixedProjectAsTeam]: async (store, { project, team, description }) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    // create new remix
    const newProject = await api.post(`/projects/${project}/remix`, { persistentToken })
    // update description
    await api.patch(`/projects/${newProject.id}`, { body: { description } , persistentToken })
    // add to team
    await api.post(`/teams/${team}/projects/${newProject.id}`)
  }
}

const byID = (items) => items.reduce((obj, item) => {
  obj[item.id] = item
  return obj
}, {})

// always returns { [id]: entity }, regardless of API type
async function getEntities ({ persistentToken, entity, idType, value, relation }) {
  const encoded = encodeURIComponent(value)
  if (relation) {
    const { items } = await api.get(
      `/v1/${entity}/by/${idType}/${relation}?${idType}=${encoded}&limit=100&orderDirection=DESC`, 
      { persistentToken }
    )
    return byID(items)
  }
  const items = await api.get(`/v1/${entity}/by/${idType}?${idType}=${encoded}`, { persistentToken })
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
  
  const result = state.resources.entities[entity][id]
  if (!result || result.expires < now) return loading
  return result
}

function useBaseResource ({ entity, idType, value, relation }) {
  const dispatch = useDispatch()
  const result = useSelector(lookup({ entity, idType, value, relation }))
  useEffect(() => {
    if (result.status === 'loading') {
      dispatch(actions.requested({ entity, idType, value, relation }))
    }
  }, [result.status, entity, idType, value, relation])
  
  return result
}

export function useResource (entity, value, idType = 'id') {
  return useBaseResource({ entity, idType, value })
}

export function useChildResource (entity, id, relation) {
  return useBaseResource({ entity, idType: 'id', value: id, relation })
}

export { actions }

export default { slice, reducer, handlers,  }
