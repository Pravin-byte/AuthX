import { createContext, useContext, useState } from 'react';

export const AppContext = createContext({
  isLoggedIn:false,
  userData:{},
  setUserData:()=>{}
});

export const AppContextProvider = ({ children }) => {
 
  const [isLoggedIn,setIsLoggedIn]=useState(false);
  const [userData,setUserData]=useState({});
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

  return (
    <AppContext.Provider value={{
      isLoggedIn,setIsLoggedIn,
      userData,setUserData,
      backendUrl
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);