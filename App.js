import { NavigationContainer } from '@react-navigation/native';
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
import IncomeListScreen from './screens/IncomeListScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();
SplashScreen.preventAutoHideAsync();

const screenOptions = {
  headerTintColor: Colors.textWhite,
  headerStyle: { backgroundColor: Colors.primary500 },
  contentStyle: { backgroundColor: Colors.primary100 },
};

function AuthenticatingStack() {
  return (
    <Drawer.Navigator screenOptions={screenOptions}>
      <Drawer.Screen name="Login" component={LoginScreen} options={{ headerLeft: () => null }} />
      <Drawer.Screen name="Signup" component={SignupScreen} options={{ headerLeft: () => null }} />
    </Drawer.Navigator>
  );
}

function AuthenticatedStack() {
  const authContext = useContext(AuthContext);

  return (
    <Drawer.Navigator initialRouteName="Incomes List" screenOptions={screenOptions}>
      <Drawer.Screen
        name="Income Tax Calculator"
        component={CalculatorScreen}
        options={{
          headerRight: ({ tintColor }) => (
            <IconButton icon="exit" size={24} color={tintColor} onPress={authContext.logout} />
          ),
        }}
      />

      <Drawer.Screen
        name="Incomes List"
        component={IncomeListScreen}
        options={{
          headerRight: ({ tintColor }) => (
            <IconButton icon="exit" size={24} color={tintColor} onPress={authContext.logout} />
          ),
        }}
      />
    </Drawer.Navigator>
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
