import React, { createContext, useState, useContext } from 'react';
import ReactDOM from 'react-dom';

const CurrentUserContext = createContext()
const useCurrentUser = () => useContext(CurrentUserContext)

const LoggedIn = ({ children}) => {
  const [currentUserFromLocalStorage, setCurrentUserFromLocalStorage] = useLocalStorage('currentUser')
  const [currentUser, setCurrentUser] = useState(currentUserFromLocalStorage)
  useEffect(() => {
    if (currentUser) return
    let shouldUseFetch = true
    fetch()
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
