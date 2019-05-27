import React, { createContext, useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';

const CurrentUserContext = createContext()
const useCurrentUser = () => useContext(CurrentUserContext)

const API_URL = 'https://api.glitch.com'

async function getUserForPersistentToken (persistentToken) {
  if (!persistentToken) throw new Error("No token provided")
  const res = await fetch(`${API_URL}/v1/users/by/persistentToken?persistentToken=${persistentToken}`)
  if (!res.ok) throw new Error(res)
  const data = await res.json()
  return res[persistentToken]
}

function useLocalStorage (key) {
  const []
}

function useAsyncFunction (fn, deps = []) {
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

const LoggedIn = ({ children}) => {
  const [persistentToken] = useLocalStorage('persistentToken')
  
  const { status, value: currentUser } = useAsyncFunction(getUserForPersistentToken, [persistentToken])
  
  return (
    <CurrentUserContext.Provider>{children}</CurrentUserContext.Provider>
  )
}




const Main = () => {
  return (
    <div>
      <div>Hello, world!</div>     
    </div>
  );
};

ReactDOM.render(<Main />, document.querySelector('#app'));
