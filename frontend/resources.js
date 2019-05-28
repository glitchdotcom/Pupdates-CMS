import { createSlice } from 'redux-starter-kit'
import { after, matchTypes } from './redux-aop'

const { slice, reducer, actions } = createSlice({
  slice: 'resources',
  initialState: {
    entities: {
      projects: {},
      users: {},
    },
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
        [request.key]: true,
      }
    }),
    loaded: (state, { payload: { request, response } }) => {
      // using immer
      state.pendingRequests[request.key] = undefined
      const expires = Date.now() + (1000 * 60 * 5)
      
      if (request.relation) {
        state.relations[request.entity][request.relation] = Object.keys(response)
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

const middleware = [
  after(matchTypes(actions.requested), (store, { payload }) => {
    if (store.getState().resources.pendingRequests[payload.key]) return
    
    getEntities()
  })
]


// always returns { [id]: entity }, regardless of API type
function getEntities ({ persistentToken, entity, key, value, relation }) {
}

export default { slice, reducer, middleware }
