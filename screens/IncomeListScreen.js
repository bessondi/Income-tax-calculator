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

  return (
    <SafeAreaView style={styles.rootContainer}>
      <Text style={styles.heading}>Previous incomes list</Text>

      {isLoadingIncomesData && !incomes.incomesList.length ? (
        <Loader />
      ) : (
        <ScrollView style={styles.list}>
          {incomes.incomesList.map(data => (
            <View key={data.id} style={styles.card}>
              <View style={styles.leftSide}>
                <Text style={styles.incomeAmount}>
                  Income: {getCurrencyIcon(data.currency)} {data.incomeAmount}
                </Text>
                <Text style={styles.taxAmountInLari}>
                  Tax: {getCurrencyIcon()} {data.taxAmountInLari}
                </Text>
              </View>
              <View style={styles.rightSide}>
                <View style={styles.incomeDate}>
                  <Text style={styles.date}>
                    <Text style={styles.month}>{getMonth(data.incomeDate)}, </Text>
                    <Text style={styles.day}>{getDay(data.incomeDate)}</Text>
                  </Text>
                  <Text style={styles.year}>{getYear(data.incomeDate)}</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                  onPress={() => removeIncome(data)}
                >
                  <Ionicons name="trash-bin-outline" size={20} color={Colors.error700} />
                </Pressable>
              </View>
            </View>
          ))}
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
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
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
    borderStyle: 'solid',
    borderColor: Colors.lightGray,
    borderWidth: 1,
    borderRadius: 16,
  },
  leftSide: { flex: 1 },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeDate: {
    marginRight: 16,
  },
  date: {
    flexDirection: 'column',
    color: Colors.mediumGray,
  },
  day: { fontSize: 14 },
  month: { fontSize: 14 },
  year: {
    textAlign: 'right',
    fontSize: 14,
    color: Colors.mediumGray,
  },
  incomeAmount: {
    color: Colors.green,
    fontSize: 18,
    marginBottom: 4,
  },
  taxAmountInLari: {
    color: Colors.error500,
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
});
