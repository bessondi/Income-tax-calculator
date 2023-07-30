import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { getDoc, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { firestoreDB } from '../constants/firebase-config';
import { Colors } from '../constants/styles';
import { AuthContext } from '../store/context/auth-context';
import { currenciesIcons, monthsList } from '../constants/consts';
import Loader from '../components/ui/Loader';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

function IncomeListScreen() {
  const authContext = useContext(AuthContext);
  const [incomes, setIncomes] = useState({ incomesList: [] });
  const [isLoadingIncomesData, setIsLoadingIncomesData] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const getIncomesData = async () => {
      if (authContext.isAuthenticated) {
        const docRef = doc(firestoreDB, 'users', authContext.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
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
    getIncomesData().then().catch(console.error);
  }, [isFocused]);

  const IncomesList = () => {
    const sortedIncomesInDescendingOrder = incomes.incomesList.sort((a, b) => {
      const firstDate = new Date(a.incomeDate).getTime();
      const secondDate = new Date(b.incomeDate).getTime();
      return firstDate > secondDate ? -1 : firstDate < secondDate ? 1 : 0;
    });

    const list = sortedIncomesInDescendingOrder.map(data => (
      <View key={data.id} style={styles.card}>
        <View style={styles.leftSide}>
          <Text style={styles.date}>
            <Text style={styles.month}>{getMonth(data.incomeDate)}, </Text>
            <Text style={styles.day}>{getDay(data.incomeDate)}</Text>
            <Text style={styles.year}> {getYear(data.incomeDate)}</Text>
          </Text>
          <Text style={styles.incomeAmount}>
            Income: {getCurrencyIcon(data.currency)} {data.incomeAmount}
          </Text>
          <Text style={styles.taxAmountInLari}>
            Tax: {getCurrencyIcon()} {data.taxAmountInLari}
          </Text>
        </View>
        <View style={styles.rightSide}>
          <Pressable
            style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
            onPress={() => removeIncome(data)}
          >
            <Ionicons name="trash-bin-outline" size={20} color={Colors.error700} />
          </Pressable>
        </View>
      </View>
    ));

    return (
      <>
        {incomes.incomesList.length ? list : <Text style={styles.emptyRecords}>You don't have any incomes yet 😊</Text>}
        {incomes.incomesList.length ? <TaxAmount /> : null}
      </>
    );
  };

  const TaxAmount = () => (
    <Text style={styles.totalTax}>{`Your total tax amount in Georgian Lari is \n ₾ ${getTotalTaxAmount()}`}</Text>
  );

  function getDay(date = '') {
    const day = date.split('-').slice(2, 3).join('');
    return day.charAt(0) === '0' ? day.substring(1, 2) : day;
  }

  function getMonth(date = '') {
    const month = date.split('-').slice(1, 2).join('');
    return month.charAt(0) !== '0' ? monthsList[month - 1] : monthsList[month.charAt(1) - 1];
  }

  function getYear(date = '') {
    return date.split('-').slice(0, 1).join('');
  }

  function getCurrencyIcon(currentCurrency = 'GEL') {
    const currency = currenciesIcons.filter(currency => currency.label === currentCurrency);
    return currency[0].icon;
  }

  function removeIncome(income) {
    updateDoc(doc(firestoreDB, 'users', authContext.uid), {
      incomesList: arrayRemove(income),
    })
      .then(() => {
        setIncomes({
          incomesList: incomes.incomesList.filter(item => item.id !== income.id),
        });
        console.log(income, 'removed');
      })
      .catch(console.error);
  }

  function getTotalTaxAmount() {
    return incomes.incomesList.reduce((total, income) => total + parseFloat(income.taxAmountInLari), 0).toFixed(2);
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <Text style={styles.heading}>Incomes list</Text>

      {isLoadingIncomesData ? (
        <Loader />
      ) : (
        <ScrollView style={styles.list}>
          <IncomesList />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default IncomeListScreen;

const styles = StyleSheet.create({
  rootContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 26,
  },
  heading: {
    fontSize: 28,
    color: Colors.gray,
    marginBottom: 16,
  },
  list: {
    width: '100%',
    paddingLeft: 24,
    paddingRight: 24,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  leftSide: { flex: 1 },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    flexDirection: 'column',
    color: Colors.mediumGray,
    marginBottom: 16,
  },
  day: { fontSize: 14 },
  month: { fontSize: 14 },
  year: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
  incomeAmount: {
    color: Colors.green,
    fontSize: 18,
    marginBottom: 4,
  },
  taxAmountInLari: {
    color: Colors.gray,
    fontSize: 18,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  pressed: {
    borderColor: Colors.error700,
  },
  emptyRecords: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 20,
    color: Colors.mediumGray,
  },
  totalTax: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.mediumGray,
    paddingTop: 16,
    paddingBottom: 32,
  },
});
