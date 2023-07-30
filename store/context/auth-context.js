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
    setAuthToken(token);
    try {
      console.log(uid, '======', token);
      if (uid && token) {
        await AsyncStorage.setItem(userUidKey, uid);
        await AsyncStorage.setItem(userTokenKey, token);
      }
    } catch (error) {
      console.warn('setItem', error);
    }
  }

  async function logout() {
    const auth = getAuth();
    signOut(auth).then(() => console.log('signOut'));

    setUserUid('');
    setAuthToken('');

    try {
      await AsyncStorage.removeItem(userUidKey);
      await AsyncStorage.removeItem(userTokenKey);
    } catch (error) {
      console.warn('removeItem', error);
    }
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
