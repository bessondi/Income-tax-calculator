import { StyleSheet, Text, View } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { firestoreDB } from '../constants/firebase-config';
import { Colors } from '../constants/styles';
import { AuthContext } from '../store/context/auth-context';
import { currenciesIcons, monthsList } from '../constants/consts';
import Loader from '../components/ui/Loader';
import { useIsFocused } from '@react-navigation/native';

function IncomeListScreen() {
  const authContext = useContext(AuthContext);
  const [incomes, setIncomes] = useState({ incomesList: [] });
  const [isLoadingIncomesData, setIsLoadingIncomesData] = useState(false);
  const isFocused = useIsFocused();

  function getMonth(date = '') {
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
        const docRef = doc(firestoreDB, 'users', authContext.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('Document data:', docSnap.data());
          setIncomes(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } else {
        await authContext.logout();
      }
      setIsLoadingIncomesData(false);
    };

    setIsLoadingIncomesData(true);
    getIncomesData().catch(console.error);
  }, [isFocused]);

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.heading}>Previous incomes</Text>

      {isLoadingIncomesData && !incomes.incomesList.length ? (
        <Loader />
      ) : (
        incomes.incomesList.map(data => (
          <View key={data.id} style={styles.card}>
            <Text style={styles.month}>{getMonth(data.incomeDate)}</Text>
            <Text style={styles.incomeAmount}>
              {getCurrencyIcon(data.currency)} {data.incomeAmount}
            </Text>
            <Text style={styles.taxAmountInLari}>
              {getCurrencyIcon()} {data.taxAmountInLari}
            </Text>
          </View>
        ))
      )}
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
