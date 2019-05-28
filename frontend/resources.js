import { createSlice } from 'redux-starter-kit'
import { after, matchTypes } from './redux-aop'
import { useCurrentUser } from './current-user'

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
function getEntities ({ persistentToken, entity, idType, value, relation }) {
  
}

const loading = { status: 'loading' }

const lookup = ({ entity, idType, value, relation }) => (state) => {
  const now = Date.now()
  const id = idType === 'id' ? value : state.index[getKey({ entity, idType, value })]
  if (!id) return loading
  
  if (relation) {
    const ids = state.relations[entity][relation][id]
    if (!ids) return loading
    const { expires, value } = ids
    if (expires < now) return loading
    const hydratedValues = value.map(itemID => state.entities[relation][itemID])
    if (hydratedValues.some(value ))
  }
}



export function useResource (entity, idType, value, relation) {
  const dispatch = useDispatch()
  const result = useSelector(lookup({ entity, idType, value, relation }))
  useEffect(() => {
    if (result.loading) {
      dispatch(actions.requested({ entity, idType: 'id', value: id }))
    }
  }, [entity, idType, value, relation])
}

export default { slice, reducer, middleware }
