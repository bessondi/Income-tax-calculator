import { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { auth } from '../../constants/firebase-config';

export const AuthContext = createContext({
  token: '',
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
});

export const userTokenKey = 'userToken';

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  auth.onAuthStateChanged(user => {
    if (user) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  });

  function authenticate(token) {
    setAuthToken(token);
    AsyncStorage.setItem(userTokenKey, token);
  }

  function logout() {
    const auth = getAuth();
    signOut(auth).then(() => console.log('signOut'));

    setAuthToken(null);
    AsyncStorage.removeItem(userTokenKey);
  }

  const value = {
    token: authToken,
    isAuthenticated: isAuth,
    authenticate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
