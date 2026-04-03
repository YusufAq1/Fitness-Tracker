import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../constants/theme';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
  },
});
