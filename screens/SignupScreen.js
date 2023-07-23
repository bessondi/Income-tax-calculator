import AuthContent from '../components/Auth/AuthContent';
import { AuthContext } from '../store/context/auth-context';
import { useContext, useState } from 'react';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestoreDB } from '../constants/firebase-config';
import { doc, setDoc } from 'firebase/firestore';

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authContext = useContext(AuthContext);

  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const uid = userCredential.user.uid;
      const initialData = { incomesList: [] };
      await setDoc(doc(firestoreDB, 'users', uid), initialData);

      await authContext.authenticate(uid, token);
    } catch (error) {
      Alert.alert('Something went wrong', 'Please check your credentials');
      console.log(error);
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Creating user..." />;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
