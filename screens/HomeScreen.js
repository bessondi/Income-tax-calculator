import { StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../store/context/auth-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../components/ui/Button';
import { Keyboard } from 'react-native';

function HomeScreen() {
  const [currencyRate, setCurrencyRate] = useState('');
  const [message, setMessage] = useState('');
  const [taxPercentValue, setTaxPercentValue] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [date, setDate] = useState(new Date());
  const authContext = useContext(AuthContext);
  const token = authContext.token;

  const onChangeDate = (_, selectedDate) => {
    setDate(selectedDate);
  };

  useEffect(() => {
    axios
      .get(`https://mobile-app-af614-default-rtdb.europe-west1.firebasedatabase.app/message.json?auth=${token}`)
      .then(response => setMessage(response.data))
      .catch(err => console.log('Message missing', err));
  }, [token]);

  const calculateTax = useCallback(() => {
    const chosenIncome = parseFloat(amountValue);

    if (!chosenIncome && !selectedCurrency) {
      return;
    }

    if (selectedCurrency === 'GEL' && taxPercentValue) {
      setCurrencyRate(((chosenIncome / 100) * taxPercentValue).toFixed(2));
      return;
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const chosenDate = `${year}-${month}-${day}`;

    const bankApi = `https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/?currencies=${selectedCurrency}&date=${chosenDate}`;

    axios
      .get(bankApi)
      .then(response => {
        const rate = parseFloat(response.data[0].currencies[0].rate);

        if (rate && chosenIncome && taxPercentValue) {
          setCurrencyRate((((rate * chosenIncome) / 100) * taxPercentValue).toFixed(2));
        }
      })
      .catch(err => console.log('Bank api error:', err));
  }, [amountValue, selectedCurrency, date]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.rootContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Monthly Income</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <View style={styles.body}>
          <TextInput
            style={styles.input}
            onChangeText={setAmountValue}
            value={amountValue}
            placeholder="Type your income amount"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            onChangeText={setTaxPercentValue}
            value={taxPercentValue}
            placeholder="Type your tax percent"
            keyboardType="numeric"
          />
          <Picker selectedValue={selectedCurrency} onValueChange={itemValue => setSelectedCurrency(itemValue)}>
            <Picker.Item label="GEL" value="GEL" />
            <Picker.Item label="USD" value="USD" />
            <Picker.Item label="EUR" value="EUR" />
          </Picker>
          <View style={styles.datePicker}>
            <DateTimePicker testID="dateTimePicker" value={date} mode="date" is24Hour={true} onChange={onChangeDate} />
          </View>
        </View>

        <View style={styles.button}>
          <Button onPress={calculateTax}>Calculate</Button>
        </View>

        <Text style={styles.result}>{!!currencyRate ? `Your Month Tax Value: ${currencyRate}` : null}</Text>
      </View>
    </TouchableWithoutFeedback>
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
  header: {
    width: '100%',
    alignItems: 'center',
  },
  body: {
    width: '100%',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  datePicker: {
    alignItems: 'center',
  },
  button: {
    flex: 1,
    marginTop: 48,
  },
  result: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
