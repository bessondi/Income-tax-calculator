import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '../../constants/styles';

function Button({ children, onPress, isMediumSize, isDisable }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && isDisable && styles.pressed,
        !isDisable && styles.disabled,
        isMediumSize ? styles.buttonMediumSize : null,
      ]}
      onPress={isDisable ? onPress : null}
    >
      <View>
        <Text style={styles.buttonText}>{children}</Text>
      </View>
    </Pressable>
  );
}

export default Button;

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary500,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonMediumSize: {
    height: 50,
    padding: 8,
    justifyContent: 'center',
    borderRadius: 8,
  },
  disabled: {
    backgroundColor: Colors.lightGray,
  },
});
