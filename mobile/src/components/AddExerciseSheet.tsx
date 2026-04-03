import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet from './BottomSheet';
import Input from './Input';
import Button from './Button';
import { spacing } from '../constants/theme';

interface AddExerciseSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName?: string;
  title?: string;
}

export default function AddExerciseSheet({
  visible,
  onClose,
  onSubmit,
  initialName = '',
  title = 'Add Exercise',
}: AddExerciseSheetProps) {
  const [name, setName] = useState(initialName);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setName('');
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <Input
        placeholder="Exercise name"
        value={name}
        onChangeText={setName}
        autoFocus
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        maxLength={50}
      />
      <View style={styles.actions}>
        <Button title="Cancel" variant="outline" onPress={onClose} style={styles.btn} />
        <Button title="Save" onPress={handleSubmit} style={styles.btn} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  btn: {
    flex: 1,
  },
});
