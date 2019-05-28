import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import styled from '@emotion/styled'
import { configureStore } from 'redux-starter-kit'
import { Provider, useDispatch } from 'react-redux'

import { actions as appActions } from './app-core'
import currentUserSlice, { useCurrentUser, useLoggedInStatus } from './current-user'
import resourcesSlice, { useChildResource, actions as resourceActions } from './resources'
import Login from './login'

const configureStoreFromSlices = (...slices) => {
  const rootReducer = {}
  const rootHandlers = {}
  for (const { slice, reducer, handlers } of slices) {
    rootReducer[slice] = reducer
    for (const [actionType, handler] of Object.entries(handlers)) {
      if (rootHandlers[actionType]) {
        rootHandlers[actionType].push(handler)
      } else {
        rootHandlers[actionType] = [handler]
      }
    }
  }
  return configureStore({
    reducer: rootReducer,
    middleware: [
      (store) => (next) => (action) => {
        const nextAction = next(action)
        if (!nextAction.type || !rootHandlers[nextAction.type]) return
        Promise.all(rootHandlers[nextAction.type](store, nextAction.payload))
          .then(nextAction.onSuccess, nextAction.onError)
      }
    ],
  })
}

const store = configureStoreFromSlices(
  currentUserSlice,
  resourcesSlice
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

const ProjectActions = ({ project }) => {
  const dispatch = useDispatch()
  const restartProject = () => {
    dispatch(resourceActions.restartedProject(project.id))
  }
  const deleteProject = () => {
    dispatch(resourceActions.deleted({ entity: 'projects', id: project.id }))
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

const SwapButton = () => {
  const [swapStatus, setSwapStatus] = useState('ready')
  const confirmThenSwap = () => {
    if (!confirm("Are you sure you want to swap community & community-staging?")) return
    setSwapStatus('ok')
  } 
  return (
    <div>
      <button onClick={confirmThenSwap}>Swap</button>
      <div>{swapStatus}</div>
    </div>
  )
}
 
const RecentProjects = () => {
  const currentUser = useCurrentUser()
  const { value: recentProjects } = useChildResource('users', currentUser.id, 'projects')
  const { value: pullRequestsByName } = useAsyncFunction(getMyPRs)
  if (!recentProjects || !pullRequestsByName) return <Loading />
  
  const communintyRemixes = recentProjects.filter(p => communityIDs.includes(p.baseId) && !communityIDs.includes(p.id))
  
  return (
    <section>
      <Header>Community Remixes</Header>
      <SwapButton />
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
