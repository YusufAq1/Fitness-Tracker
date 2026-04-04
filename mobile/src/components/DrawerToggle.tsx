import { Pressable, Text, StyleSheet } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { colors, fonts } from '../constants/theme';

export default function DrawerToggle() {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={styles.btn}
      hitSlop={12}
    >
      <Text style={styles.icon}>{'\u2630'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
    marginRight: 12,
  },
  icon: {
    fontFamily: fonts.body,
    fontSize: 22,
    color: colors.accent,
  },
});
