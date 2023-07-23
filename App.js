import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AuthContextProvider, { AuthContext, userTokenKey } from './store/context/auth-context';
import { Colors } from './constants/styles';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import IconButton from './components/ui/IconButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

const Stack = createNativeStackNavigator();
SplashScreen.preventAutoHideAsync();

const screenOptions = {
  headerTintColor: Colors.textWhite,
  headerStyle: { backgroundColor: Colors.primary500 },
  contentStyle: { backgroundColor: Colors.primary100 },
};

function AuthenticatingStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const authContext = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Georgia Income Tax"
        component={CalculatorScreen}
        options={{
          headerLeft: ({ tintColor }) => <IconButton icon="menu" size={30} color={tintColor} />,
          headerRight: ({ tintColor }) => (
            <IconButton icon="exit" size={24} color={tintColor} onPress={authContext.logout} />
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function Navigation() {
  const authContext = useContext(AuthContext);

  return (
    <NavigationContainer>
      {authContext.isAuthenticated ? <AuthenticatedStack /> : <AuthenticatingStack />}
    </NavigationContainer>
  );
}

function Root() {
  const authContext = useContext(AuthContext);
  const [isLoginInProgress, setIsLoginInProgress] = useState(true);

  useEffect(() => {
    async function loadingDataAsync() {
      try {
        const token = await AsyncStorage.getItem(userTokenKey);

        if (token) {
          authContext.authenticate(token);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoginInProgress(false);
        SplashScreen.hideAsync();
      }
    }

    loadingDataAsync();
  }, []);

  return !isLoginInProgress ? <Navigation /> : null;
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthContextProvider>
        <Root />
      </AuthContextProvider>
    </>
  );
}
