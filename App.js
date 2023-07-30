import { NavigationContainer } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AuthContextProvider, { AuthContext, userTokenKey, userUidKey } from './store/context/auth-context';
import { Colors } from './constants/styles';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import IconButton from './components/ui/IconButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import IncomeListScreen from './screens/IncomeListScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();
SplashScreen.preventAutoHideAsync();

const screenOptions = {
  headerTintColor: Colors.white,
  headerStyle: { backgroundColor: Colors.primary500 },
  contentStyle: { backgroundColor: Colors.primary100 },
};

function AuthenticatingStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerLeft: () => null }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerLeft: () => null }} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const authContext = useContext(AuthContext);

  return (
    <BottomTab.Navigator initialRouteName="Tax Calculator" screenOptions={screenOptions}>
      <BottomTab.Screen
        name="Tax Calculator"
        component={CalculatorScreen}
        options={{
          headerRight: ({ tintColor }) => (
            <IconButton icon="exit" size={24} color={tintColor} onPress={authContext.logout} />
          ),
          tabBarIcon: ({ color, size }) => <Ionicons name="calculator" color={color} size={size} />,
        }}
      />

      <BottomTab.Screen
        name="My Incomes"
        component={IncomeListScreen}
        options={{
          headerRight: ({ tintColor }) => (
            <IconButton icon="exit" size={24} color={tintColor} onPress={authContext.logout} />
          ),
          tabBarIcon: ({ color, size }) => <Entypo name="list" size={size} color={color} />,
        }}
      />
    </BottomTab.Navigator>
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
        const uid = await AsyncStorage.getItem(userUidKey);
        const token = await AsyncStorage.getItem(userTokenKey);

        if (uid && token) {
          await authContext.authenticate(uid, token);
        }
      } catch (error) {
        console.warn(error);
      } finally {
        setIsLoginInProgress(false);
        await SplashScreen.hideAsync();
      }
    }

    loadingDataAsync().then().catch(console.error);
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
