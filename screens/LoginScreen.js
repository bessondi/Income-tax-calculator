import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../store/context/auth-context';
import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../constants/firebase-config';

function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authContext = useContext(AuthContext);

  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const uid = userCredential.user.uid;
      await authContext.authenticate(uid, token);
    } catch (_) {
      Alert.alert('Authentication failed', 'Try again later');
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Logging..." />;
  }

  return <AuthContent isLogin onAuthenticate={loginHandler} />;
}

export default LoginScreen;
