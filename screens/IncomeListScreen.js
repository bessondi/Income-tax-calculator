import { StyleSheet, Text, View } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { firestoreDB } from '../constants/firebase-config';
import { Colors } from '../constants/styles';
import { AuthContext } from '../store/context/auth-context';
import { currenciesIcons, monthsList } from '../constants/consts';

function IncomeListScreen() {
  const authContext = useContext(AuthContext);
  const [incomeList, setIncomeList] = useState([]);

  function getMonth(date) {
    const month = date.split('-').slice(1, 2).join('');
    return month.charAt(0) !== '0' ? monthsList[month - 1] : monthsList[month.charAt(1) - 1];
  }

  function getCurrencyIcon(currentCurrency = 'GEL') {
    const currency = currenciesIcons.filter(currency => currency.label === currentCurrency);
    return currency[0].icon;
  }

  useEffect(() => {
    const getIncomesData = async () => {
      if (authContext.isAuthenticated) {
        const snapshot = await getDocs(collection(firestoreDB, 'users'));
        const incomes = [];

        snapshot.forEach(doc => {
          incomes.push({
            id: (Math.random() + 1).toString(36).substring(2),
            data: doc.data(),
          });
        });

        setIncomeList(incomes);
      }
    };

    getIncomesData().catch(console.error);
  }, []);

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.heading}>Previous incomes</Text>

      {incomeList.map(income => (
        <View key={income.id} style={styles.card}>
          <Text style={styles.month}>{getMonth(income.data.incomeDate)}</Text>
          <Text style={styles.incomeAmount}>
            {getCurrencyIcon(income.data.currency)} {income.data.incomeAmount}
          </Text>
          <Text style={styles.taxAmountInLari}>
            {getCurrencyIcon()} {income.data.taxAmountInLari}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default IncomeListScreen;

const styles = StyleSheet.create({
  rootContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 16,
  },
  heading: {
    fontSize: 24,
    color: Colors.gray,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderStyle: 'solid',
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
  },
  month: { fontSize: 22 },
  incomeAmount: {},
  taxAmountInLari: {},
});
