import React, { createContext, useState, useContext, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import styled from '@emotion/styled'
import { configureStore, createSlice } from 'redux-starter-kit'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { matchTypes, after } from 'redux-aop'

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

// app

const API_URL = 'https://api.glitch.com'

const app = {
  actions: {
    mounted: () => ({ type: 'app/mounted' })
  }
}

// current user

const currentUser = createSlice({
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
    loadedLoggedOutUser: (state, { payload }) => ({
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

currentUser.middleware = [
  after(matchTypes('app/mounted'), async (store) => {
    const persistentToken = getFromStorage('persistentToken')
    try {
      const currentUser = await getUserForPersistentToken(persistentToken)
      store.dispatch(currentUser.actions.loadedLoggedInUser(currentUser))
    } catch (e) {
      store.dispatch(currentUser.actions.loadedLoggedOutUser())
    }
  }),
  after(matchTypes(currentUser.actions.submittedEmail), (_, { payload: emailAddress }) => {
    fetch(`${API_URL}/email/sendLoginEmail`, { 
      method: 'POST', 
      body: JSON.stringify({ emailAddress }),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        // TODO: need auth header here?
      },
    })
  }),
  after(matchTypes(currentUser.actions.submittedSignInCode), async (store, { payload: code }) => {
    try {
      const res = await fetch(`${API_URL}/auth/email/${code}`, { method: 'POST', mode: 'cors' })
      const { persistentToken } = await res.json()
      const currentUser = await getUserForPersistentToken(persistentToken)
      setStorage('persistentToken', persistentToken)
      store.dispatch(currentUser.actions.loadedLoggedInUser(currentUser))
    } catch (e) {
      store.dispatch(currentUser.actions.loadedLoggedOutUser())
    }
  }),
  after(matchTypes(currentUser.actions.loggedOut), async () => {
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

const useLoggedInStatus = () => useSelector(store => store.currentUser.status)



const store = configureStore({
  reducers: {
    currentUser: currentUser.reducer,
  },
  middleware: [...currentUser.middleware],
})

const useCurrentUser = () => useSelector(store => store.cur)


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

const EmailForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('') 
  const onSubmitForm = (e) => {
    e.preventDefault()
    onSubmit(email)
  }
  return (
    <form onSubmit={onSubmitForm}>
      <label>
        <div>Email</div>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
      </label>
      <button type="submit">submit</button>
    </form>
  )
}

const CodeForm = ({ onSubmit }) => {
  const [code, setCode] = useState('') 
  const onSubmitForm = (e) => {
    e.preventDefault()
    onSubmit(code)
  }
  return (
    <form onSubmit={onSubmitForm}>
      <label>
        <div>Sign in code</div>
        <input type="text" value={code} onChange={e => setCode(e.target.value)}/>
      </label>
      <button type="submit">submit</button>
    </form>
  )
}

const Login = () => {
  const [status, setStatus] = useState('init') // init | submittedEmail
  const dispatch = useDispatch()
  const submitEmail = (email) => {
    setStatus('submittedEmail')
    dispatch(currentUser.actions.submittedEmail(email))
  }
  const submitSigninCode = async (code) => {
    dispatch(currentUser.actions.submittedSignInCode(code))
  }
  
  if (status === 'init') return <EmailForm onSubmit={submitEmail} />
  return <CodeForm onSubmit={submitSigninCode} />
}

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
  tr:nth-child(even) {
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
                <td>{pr && (
                    <a href={pr.url}>{pr.title}</a>
                  )}</td>
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
    dispatch(app.actions.mounted())
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
