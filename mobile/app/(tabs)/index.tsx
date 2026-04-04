import { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { pushTemplate, removeTemplate } from '../../src/lib/sync';
import { useToast } from '../../src/hooks/useToast';
import { todayHeader } from '../../src/utils/date';
import { colors, fonts, spacing } from '../../src/constants/theme';
import DayCard from '../../src/components/DayCard';
import Button from '../../src/components/Button';
import AddDaySheet from '../../src/components/AddDaySheet';
import AddExerciseSheet from '../../src/components/AddExerciseSheet';
import ConfirmDialog from '../../src/components/ConfirmDialog';
import DrawerToggle from '../../src/components/DrawerToggle';

export default function WorkoutsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const days = useStore((s) => s.days);
  const addDay = useStore((s) => s.addDay);
  const updateDay = useStore((s) => s.updateDay);
  const deleteDay = useStore((s) => s.deleteDay);
  const addExercise = useStore((s) => s.addExercise);
  const updateExercise = useStore((s) => s.updateExercise);
  const deleteExercise = useStore((s) => s.deleteExercise);

  const [showAddDay, setShowAddDay] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editDay, setEditDay] = useState<{ id: string; name: string } | null>(null);
  const [editExercise, setEditExercise] = useState<{ dayId: string; exId: string; name: string } | null>(null);
  const [addExDayId, setAddExDayId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'day' | 'exercise'; dayId: string; exId?: string } | null>(null);

  const handleAddDay = useCallback((name: string) => {
    const day = addDay(name);
    pushTemplate(day);
    showToast('Day added');
  }, [addDay, showToast]);

  const handleRenameDay = useCallback((dayId: string, currentName: string) => {
    setEditDay({ id: dayId, name: currentName });
  }, []);

  const handleRenameDaySubmit = useCallback((name: string) => {
    if (!editDay) return;
    updateDay(editDay.id, name);
    const day = useStore.getState().days.find((d) => d.id === editDay.id);
    if (day) pushTemplate(day);
    showToast('Day renamed');
    setEditDay(null);
  }, [editDay, updateDay, showToast]);

  const handleDeleteDay = useCallback((dayId: string) => {
    setConfirmDelete({ type: 'day', dayId });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'day') {
      deleteDay(confirmDelete.dayId);
      removeTemplate(confirmDelete.dayId);
      showToast('Day deleted');
    } else if (confirmDelete.exId) {
      deleteExercise(confirmDelete.dayId, confirmDelete.exId);
      const day = useStore.getState().days.find((d) => d.id === confirmDelete.dayId);
      if (day) pushTemplate(day);
      showToast('Exercise deleted');
    }
    setConfirmDelete(null);
  }, [confirmDelete, deleteDay, deleteExercise, showToast]);

  const handleAddExercise = useCallback((dayId: string) => {
    setAddExDayId(dayId);
    setShowAddExercise(true);
  }, []);

  const handleAddExerciseSubmit = useCallback((name: string) => {
    if (!addExDayId) return;
    addExercise(addExDayId, name);
    const day = useStore.getState().days.find((d) => d.id === addExDayId);
    if (day) pushTemplate(day);
    showToast('Exercise added');
    setAddExDayId(null);
  }, [addExDayId, addExercise, showToast]);

  const handleRenameExercise = useCallback((dayId: string, exId: string, currentName: string) => {
    setEditExercise({ dayId, exId, name: currentName });
  }, []);

  const handleRenameExerciseSubmit = useCallback((name: string) => {
    if (!editExercise) return;
    updateExercise(editExercise.dayId, editExercise.exId, name);
    const day = useStore.getState().days.find((d) => d.id === editExercise.dayId);
    if (day) pushTemplate(day);
    showToast('Exercise renamed');
    setEditExercise(null);
  }, [editExercise, updateExercise, showToast]);

  const handleDeleteExercise = useCallback((dayId: string, exId: string) => {
    setConfirmDelete({ type: 'exercise', dayId, exId });
  }, []);

  const handleExercisePress = useCallback((dayId: string, exId: string, exName: string, dayName: string) => {
    router.push({
      pathname: '/log',
      params: { dayId, exId, exName, dayName },
    });
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <DrawerToggle />
          <Image source={require('../../assets/icon.png')} style={styles.logoIcon} />
          <Text style={styles.logo}>VYRA</Text>
        </View>
        <Text style={styles.date}>{todayHeader()}</Text>
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={120}
        enableOnAndroid
        enableResetScrollToCoords={false}
      >
        <Text style={styles.sectionTitle}>YOUR DAYS</Text>

        {days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            onAddExercise={handleAddExercise}
            onRenameDay={handleRenameDay}
            onDeleteDay={handleDeleteDay}
            onRenameExercise={handleRenameExercise}
            onDeleteExercise={handleDeleteExercise}
            onExercisePress={handleExercisePress}
          />
        ))}

        <Button
          title="+ Add Workout Day"
          variant="outline"
          onPress={() => setShowAddDay(true)}
          style={styles.addDayBtn}
        />

      </KeyboardAwareScrollView>

      <AddDaySheet
        visible={showAddDay}
        onClose={() => setShowAddDay(false)}
        onSubmit={handleAddDay}
      />

      <AddDaySheet
        visible={!!editDay}
        onClose={() => setEditDay(null)}
        onSubmit={handleRenameDaySubmit}
        initialName={editDay?.name}
        title="Rename Day"
      />

      <AddExerciseSheet
        visible={showAddExercise}
        onClose={() => { setShowAddExercise(false); setAddExDayId(null); }}
        onSubmit={handleAddExerciseSubmit}
      />

      <AddExerciseSheet
        visible={!!editExercise}
        onClose={() => setEditExercise(null)}
        onSubmit={handleRenameExerciseSubmit}
        initialName={editExercise?.name}
        title="Rename Exercise"
      />

      <ConfirmDialog
        visible={!!confirmDelete}
        title={confirmDelete?.type === 'day' ? 'Delete Day' : 'Delete Exercise'}
        message="This action cannot be undone."
        confirmLabel="DELETE"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 7,
    marginRight: 8,
  },
  logo: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.accent,
    letterSpacing: 2,
  },
  date: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  addDayBtn: {
    marginTop: spacing.sm,
  },
});
