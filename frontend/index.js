import React, { createContext, useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';

const CurrentUserContext = createContext()
const useCurrentUser = () => useContext(CurrentUserContext)

const API_URL = 'https://api.glitch.com'

const LoggedIn = ({ children}) => {
  const [persistentToken] = useLocalStorage('persistentToken')
  const [{ status, currentUser }, setState] = useState({ status: 'loading' })
  useEffect(() => {
    if (!persistentToken) {
      setState({ status: 'loggedOut' })
      return
    }
    
    let shouldUseFetch = true
    fetch(`${API_URL}/v1/users/by/persistentToken?persistentToken=${persistentToken}`)
      .then(res => {})
      .then(data => {
        if (!shouldUseFetch) return
        const currentUser = data[]
        setState({ status: 'loggedIn', currentUser })
      })
    return () => { shouldUseFetch = false }
  }, [])
  
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
