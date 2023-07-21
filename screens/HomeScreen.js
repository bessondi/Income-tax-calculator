import { StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../store/context/auth-context';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../components/ui/Button';
import { Keyboard } from 'react-native';
import { Colors } from '../constants/styles';

const currencyList = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GEL', value: 'GEL' },
];

function HomeScreen() {
  // const [isLoadingData, setIsLoadingData] = useState(false); // TODO: Add loader
  const [currencyRate, setCurrencyRate] = useState('');
  const [messageFromServer, setMessageFromServer] = useState('');
  const [taxPercentValue, setTaxPercentValue] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const authContext = useContext(AuthContext);
  const token = authContext.token;

  const onChangeDate = (_, selectedDate) => {
    setDate(selectedDate);
  };

  useEffect(() => {
    axios
      .get(`https://mobile-app-af614-default-rtdb.europe-west1.firebasedatabase.app/message.json?auth=${token}`)
      .then(response => setMessageFromServer(response.data))
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

    const bankCurrencyApi = `https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/?currencies=${selectedCurrency}&date=${chosenDate}`;

    axios
      .get(bankCurrencyApi)
      .then(response => {
        const rate = parseFloat(response.data[0].currencies[0].rate); // TODO: Add useMemo

        if (rate && chosenIncome && taxPercentValue) {
          setCurrencyRate((((rate * chosenIncome) / 100) * taxPercentValue).toFixed(2));
        }
      })
      .catch(err => console.log('Something went wrong:', err));
  }, [amountValue, taxPercentValue, selectedCurrency, date]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.rootContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Monthly Income</Text>
          {messageFromServer ? <Text style={styles.message}>messageFromServer</Text> : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Monthly income amount</Text>
          <View style={styles.top}>
            <TextInput
              style={styles.input}
              onChangeText={setAmountValue}
              value={amountValue}
              placeholder="Type your income amount"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Tax percent</Text>
            <TextInput
              style={styles.input}
              onChangeText={setTaxPercentValue}
              value={taxPercentValue}
              placeholder="Type your tax percent"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.bottom}>
            <View style={styles.bottomLeft}>
              <Text style={styles.label}>Currency</Text>
              <DropDownPicker
                open={isCurrencyDropdownOpen}
                setOpen={setIsCurrencyDropdownOpen}
                value={selectedCurrency}
                setValue={setSelectedCurrency}
                items={currencyList}
                placeholder="Select currency"
                style={styles.currencyPicker}
              />
            </View>
            <View style={styles.bottomRight}>
              <Text style={styles.dateLabel}>Income date</Text>
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                is24Hour={true}
                onChange={onChangeDate}
                style={styles.datePicker}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button onPress={calculateTax} isMediumSize={true}>
            Calculate
          </Button>
        </View>

        <Text style={styles.result}>{!!currencyRate ? `Your tax for this month is ₾${currencyRate}` : null}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 4,
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
  },
  header: {
    width: '100%',
    alignItems: 'center',
  },
  body: {
    width: '100%',
  },
  input: {
    fontSize: 16,
    height: 46,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  bottom: {
    flexDirection: 'row',
  },
  bottomLeft: {
    flex: 1,
  },
  bottomRight: {
    flex: 1,
  },
  currencyPicker: {
    marginBottom: 16,
  },
  datePicker: {
    marginTop: 6,
  },
  footer: {
    zIndex: -1,
  },
  result: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    borderStyle: 'solid',
    borderColor: Colors.green,
    borderWidth: 1,
    borderRadius: 24,
    marginTop: 48,
    padding: 16,
    width: '100%',
  },
});
