import AuthContent from '../components/Auth/AuthContent';
import { AuthContext } from '../store/context/auth-context';
import { useContext, useState } from 'react';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../constants/firebase-config';

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authContext = useContext(AuthContext);

  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      authContext.authenticate(token);
    } catch (_) {
      Alert.alert('Something went wrong', 'Please check your credentials');
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Creating user..." />;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
