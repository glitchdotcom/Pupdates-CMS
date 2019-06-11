import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import styled from '@emotion/styled'
import { configureStore } from 'redux-starter-kit'
import { Provider, useDispatch } from 'react-redux'

import { actions as appActions } from './app-core'
import currentUserSlice, { useCurrentUser, useLoggedInStatus, actions as currentUserActions } from './current-user'
import resourcesSlice from './resources'
import Login from './login'
import Button from './button'
import Box, { Flex } from './box'

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
        Promise.all(rootHandlers[nextAction.type].map(handler => handler(store, nextAction.payload)))
          .then(nextAction.onSuccess, nextAction.onError)
      }
    ],
  })
}

const store = configureStoreFromSlices(
  currentUserSlice,
  resourcesSlice
)

const Loading = () => <div>Loading...</div>

const PageHeader = () => {
  const dispatch = useDispatch()
  const currentUser = useCurrentUser()
  return (
    <Flex as="header" align="center" justify="flex-end" padding={{y: 2}}>
      <Box padding={{ right: 2 }}>
        Logged in as {currentUser.login}
      </Box>
      <Button type="secondary" onClick={() => dispatch(currentUserActions.loggedOut())}>log out</Button>
    </Flex>
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
  return (
    <div>
      <PageHeader />
    </div>
  )
}


const RootContainer = styled.div`
  font-family: 'Benton Sans', sans-serif;
  color: #222;
  max-width: 960px;
  margin: 0 auto;
  line-height: 1.25;
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
