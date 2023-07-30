import { StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../store/context/auth-context';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../components/ui/Button';
import { Keyboard } from 'react-native';
import { Colors } from '../constants/styles';
import Loader from '../components/ui/Loader';
import { firestoreDB } from '../constants/firebase-config';
import { currencyList } from '../constants/consts';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

function CalculatorScreen() {
  const [currencyRate, setCurrencyRate] = useState('');
  const [isCalculationAvailable, setIsCalculationAvailable] = useState(false);
  const [hasTaxCalculation, setHasTaxCalculation] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [taxPercentValue, setTaxPercentValue] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [messageFromServer, setMessageFromServer] = useState('');
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext.isAuthenticated) {
      axios
        .get(
          `https://mobile-app-af614-default-rtdb.europe-west1.firebasedatabase.app/message.json?auth=${authContext.token}`,
        )
        .then(response => setMessageFromServer(response.data))
        .catch(err => console.log('Message missing', err));
    }
  }, [authContext.isAuthenticated, authContext.token]);

  useEffect(() => {
    const isFormValid = !!(
      parseInt(amountValue) &&
      parseInt(taxPercentValue) &&
      selectedCurrency &&
      new Date(date).getTime() <= Date.now()
    );
    if (isFormValid) {
      setIsCalculationAvailable(true);
      setHasTaxCalculation(false);
    } else {
      setIsCalculationAvailable(false);
    }
  }, [amountValue, taxPercentValue, selectedCurrency, date]);

  const CalculateButton = ({ isDisable }) => {
    return (
      <View style={styles.footer}>
        <Button onPress={calculateTax} isMediumSize={true} isDisable={isDisable}>
          Calculate Tax
        </Button>
      </View>
    );
  };

  const CalculationResult = () => {
    return (
      <>
        <View style={styles.result}>
          <Text style={styles.resultTitle}>
            {`Your tax for this income is \n`}
            <Text style={styles.resultTax}>{`₾ ${currencyRate}`}</Text>
          </Text>
          <Text style={styles.resultNote}>
            This tax amount has been saved in your incomes list. Now you can pay it in lari at the tax service of
            Georgia.
          </Text>
        </View>
      </>
    );
  };

  const onChangeDate = (_, selectedDate) => {
    setDate(selectedDate);
  };

  const getDateInString = () => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateTax = async () => {
    const amount = parseFloat(amountValue);
    const incomeDate = getDateInString();
    const bankCurrencyApi = `https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/?currencies=${selectedCurrency}&date=${incomeDate}`;

    if (selectedCurrency === 'GEL' && taxPercentValue) {
      const taxAmount = ((amount / 100) * taxPercentValue).toFixed(2);
      setCurrencyRate(taxAmount);

      const data = {
        id: Date.now(),
        incomeAmount: amount,
        incomeDate: incomeDate,
        currency: selectedCurrency,
        bankRateForSelectedDateAndCurrency: null,
        taxAmountInLari: taxAmount,
      };

      await updateDoc(doc(firestoreDB, 'users', authContext.uid), {
        incomesList: arrayUnion(data),
      });

      setHasTaxCalculation(true);
      return;
    }

    setIsLoadingData(true);

    axios
      .get(bankCurrencyApi)
      .then(response => {
        const rate = parseFloat(response.data[0].currencies[0].rate);

        if (rate && amount && taxPercentValue) {
          const taxAmount = (((rate * amount) / 100) * taxPercentValue).toFixed(2);

          setCurrencyRate(taxAmount);
          setHasTaxCalculation(true);

          const data = {
            id: Date.now(),
            incomeAmount: amount,
            incomeDate: incomeDate,
            currency: selectedCurrency,
            bankRateForSelectedDateAndCurrency: rate,
            taxAmountInLari: taxAmount,
          };

          return updateDoc(doc(firestoreDB, 'users', authContext.uid), {
            incomesList: arrayUnion(data),
          });
        }
      })
      .catch(error => {
        setHasTaxCalculation(false);
        console.log('Something went wrong:', error);
      })
      .finally(() => setIsLoadingData(false));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.rootContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Income</Text>
          {messageFromServer ? <Text style={styles.message}>{messageFromServer}</Text> : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Income amount</Text>
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
              placeholder="Type your tax percentage"
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
            <View>
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

        {hasTaxCalculation ? (
          !!currencyRate ? (
            <CalculationResult />
          ) : null
        ) : isLoadingData ? (
          <Loader />
        ) : (
          <CalculateButton isDisable={!isCalculationAvailable} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

export default CalculatorScreen;

const styles = StyleSheet.create({
  rootContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: 28,
    color: Colors.gray,
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 18,
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
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.white,
  },
  bottom: {
    flexDirection: 'row',
  },
  bottomLeft: {
    flex: 1,
  },
  currencyPicker: {
    marginBottom: 12,
    borderColor: Colors.lightGray,
  },
  datePicker: {
    marginTop: 8,
  },
  footer: {
    marginTop: 12,
    width: '100%',
    zIndex: -1,
  },
  result: {
    borderStyle: 'solid',
    borderColor: Colors.green,
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 16,
    padding: 16,
    width: '100%',
    zIndex: -1,
  },
  resultTitle: {
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
  },
  resultTax: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultNote: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 16,
  },
});
