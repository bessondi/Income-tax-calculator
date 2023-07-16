import { StyleSheet, Text, View } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../store/context/auth-context';

function HomeScreen() {
  const [message, setMessage] = useState('');

  const authContext = useContext(AuthContext);
  const token = authContext.token;

  useEffect(() => {
    axios
      .get(`https://mobile-app-af614-default-rtdb.europe-west1.firebasedatabase.app/message.json?auth=${token}`)
      .then(response => setMessage(response.data));
  }, [token]);

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 24,
  },
});
