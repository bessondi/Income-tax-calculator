import { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { auth } from '../../constants/firebase-config';

export const AuthContext = createContext({
  token: '',
  uid: '',
  isAuthenticated: false,
  authenticate: async () => {},
  logout: async () => {},
});

export const userUidKey = 'userUid';
export const userTokenKey = 'userToken';

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState('');
  const [userUid, setUserUid] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  auth.onAuthStateChanged(user => {
    if (user) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  });

  async function authenticate(uid, token) {
    setUserUid(uid);
    await AsyncStorage.setItem(userUidKey, uid);
    setAuthToken(token);
    await AsyncStorage.setItem(userTokenKey, token);
  }

  async function logout() {
    const auth = getAuth();
    signOut(auth).then(() => console.log('signOut'));

    setUserUid(null);
    await AsyncStorage.removeItem(userUidKey);
    setAuthToken(null);
    await AsyncStorage.removeItem(userTokenKey);
  }

  const value = {
    token: authToken,
    uid: userUid,
    isAuthenticated: isAuth,
    authenticate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
