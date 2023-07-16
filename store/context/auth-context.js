import { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({
  token: '',
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
});

export const userTokenKey = 'userToken';

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState('');

  function authenticate(token) {
    setAuthToken(token);
    AsyncStorage.setItem(userTokenKey, token);
  }

  function logout() {
    setAuthToken(null);
    AsyncStorage.removeItem(userTokenKey);
  }

  const value = {
    token: authToken,
    isAuthenticated: !!authToken,
    authenticate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
