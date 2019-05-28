import React, { useState, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import styled from '@emotion/styled'
import { configureStore } from 'redux-starter-kit'
import { Provider, useDispatch } from 'react-redux'

import { API_URL, actions as appActions } from './app-core'
import currentUserSlice, { useCurrentUser, useLoggedInStatus } from './current-user'
import Login from './login'

const configureStoreFromSlices = (...slices) => {
  const rootReducer = {}
  const rootMiddleware = []
  for (const { slice, reducer, middleware } of slices) {
    rootReducer[slice] = reducer
    rootMiddleware.push(...middleware)
  }
  return configureStore({
    reducer: rootReducer,
    middleware: rootMiddleware,
  })
}

const store = configureStoreFromSlices(
  currentUserSlice
)

function useAsyncFunction (fn, ...deps) {
  const [state, setState] = useState({ status: 'pending' })
  useEffect(() => {
    let isCurrentRequest = true
    fn(...deps).then(
      value => {
        if (!isCurrentRequest) return
        setState({ status: 'resolved', value })
      },
      error => {
        if (!isCurrentRequest) return
        setState({ status: 'rejected', error })
      }
    )
    return () => {
      isCurrentRequest = false
    }
  }, deps)
  return state
}

const Loading = () => <div>Loading...</div>

const useAPI = () => {
  const currentUser = useCurrentUser()
  return useMemo(() => {
    const apiWrapper = {
      get: (path) => fetch(`${API_URL}${path}`, {
        mode: 'cors',
        headers: { 'Authorization': currentUser.persistentToken },
      }).then(res => res.json()),
      post: (path, body) => fetch(`${API_URL}${path}`, {
        method: 'POST',
        mode: 'cors',
        body: body ? JSON.stringify(body) : undefined,
        headers: { 
          'Authorization': currentUser.persistentToken,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
      }),
      delete: (path) => fetch(`${API_URL}${path}`, {})
      getResource: (type, key, value, subResource) => {
        if (subResource) {
          const params = '&limit=100&orderKey=createdAt&orderDirection=DESC'
          return apiWrapper.get(
            `/v1/${type}/by/${key}/${subResource}?${key}=${encodeURIComponent(value)}${params}`)
            .then(res => res.items)
        }
        return apiWrapper.get(`/${type}/by/${key}?${key}=${encodeURIComponent(value)}`)
          .then(res => res[value])
      }
    }
    return apiWrapper
  }, [currentUser])
}

const useResource = (type, key, value, subResource) => {
  const api = useAPI()
  return useAsyncFunction(api.getResource, type, key, value, subResource)
}

const ProjectActions = ({ project }) => {
  const api = useAPI()
  const restartProject = () => {
    api.post(`/projects/${project.domain}/stop`)
  }
  const deleteProject = () => {
    api.delete(`/projects/${project.id}`)
  }
  return (
    <div>
      <button onClick={restartProject}>Restart</button>
      <button onClick={deleteProject}>Delete</button>
    </div>
  ) 
}

// community remixes are from _either_ commmunity or community-staging
const communityIDs = [
  "02863ac1-a499-4a41-ac9c-41792950000f",
  "2bdfb3f8-05ef-4035-a06e-2043962a3a13"
]

async function getMyPRs () {
  const res = await fetch('https://api.github.com/repos/FogCreek/Glitch-Community/pulls')
  const prs = await res.json()
  const out = {}
  for (const pr of prs) {
    if (pr.user.login !== 'modernserf') continue
    out[pr.head.ref] = pr
  }
  return out
}

const Header = styled.h1`
  font-weight: bold;
  font-size: 2rem;
`

const Table = styled.table`
  th {
    text-align: left;
  }
  th, td {
    padding: 0.5rem;
  }
  tr:nth-of-type(even) {
    background-color: #fef;
  }
` 
 
const RecentProjects = () => {
  const currentUser = useCurrentUser()
  const { value: recentProjects } = useResource('users', 'id', currentUser.id, 'projects')
  const { value: pullRequestsByName } = useAsyncFunction(getMyPRs)
  if (!recentProjects || !pullRequestsByName) return <Loading />
  
  const communintyRemixes = recentProjects.filter(p => communityIDs.includes(p.baseId) && !communityIDs.includes(p.id))
  
  return (
    <section>
      <Header>Community Remixes</Header>
      <Table>
        <thead>
          <tr>
            <th>domain</th>
            <th>description</th>
            <th>PR</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {communintyRemixes.map(project => {
            const pr = pullRequestsByName[project.domain]
            return(
              <tr key={project.id}>
                <td>{project.domain}</td>
                <td>{project.description}</td>
                <td>{pr && <a href={pr.url}>{pr.title}</a>}</td>
                <td><ProjectActions project={project} /></td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </section>
  )
}

const App = () => {
  const dispatch = useDispatch()
  const status = useLoggedInStatus()
  useEffect(() => {
    dispatch(appActions.mounted())
  }, [])
  
  if (status === 'loading') return <Loading/>
  if (status === 'loggedOut') return <Login />
  return <RecentProjects />
}


const RootContainer = styled.div`
  font-family: sans-serif;
  color: #222;
  max-width: 960px;
  margin: 0 auto;
`

const AppContainer = () => {
  return (
    <Provider store={store}>
      <RootContainer>
        <App />
      </RootContainer>
    </Provider>
  )
}

ReactDOM.render(<AppContainer />, document.querySelector('#app'))
