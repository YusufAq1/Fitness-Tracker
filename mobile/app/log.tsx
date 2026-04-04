import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { pushLog } from '../src/lib/sync';
import { useToast } from '../src/hooks/useToast';
import { todayHeader, formatDate } from '../src/utils/date';
import { colors, fonts, spacing } from '../src/constants/theme';
import SetRow from '../src/components/SetRow';
import UnitToggle from '../src/components/UnitToggle';
import Button from '../src/components/Button';

interface SetInput {
  kg: string;
  reps: string;
}

export default function LogScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{
    dayId: string;
    exId: string;
    exName: string;
    dayName: string;
    logId?: string;
  }>();

  const logs = useStore((s) => s.logs);
  const addLogAction = useStore((s) => s.addLog);
  const updateLogAction = useStore((s) => s.updateLog);
  const currentUnit = useStore((s) => s.currentUnit);
  const setUnit = useStore((s) => s.setUnit);

  const isEditing = !!params.logId;
  const editingLog = isEditing ? logs.find((l) => l.id === params.logId) : null;

  // Get last log for this exercise to pre-fill
  const lastLog = useMemo(() => {
    return logs
      .filter((l) => l.exerciseId === params.exId)
      .sort((a, b) => b.date - a.date)[0] ?? null;
  }, [logs, params.exId]);

  const [sets, setSets] = useState<SetInput[]>([]);
  const [unit, setLocalUnit] = useState<'kg' | 'lbs'>(currentUnit);

  useEffect(() => {
    if (isEditing && editingLog) {
      setSets(editingLog.sets.map((s) => ({ kg: String(s.kg), reps: String(s.reps) })));
      setLocalUnit(editingLog.sets[0]?.unit || currentUnit);
    } else if (lastLog) {
      setSets(lastLog.sets.map((s) => ({ kg: String(s.kg), reps: String(s.reps) })));
      setLocalUnit(lastLog.sets[0]?.unit || currentUnit);
    } else {
      setSets([{ kg: '', reps: '' }]);
    }
  }, []);

  function updateSet(index: number, field: 'kg' | 'reps', value: string) {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function deleteSet(index: number) {
    if (sets.length <= 1) return;
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  function addSet() {
    const lastKg = sets[sets.length - 1]?.kg || '';
    setSets((prev) => [...prev, { kg: lastKg, reps: '' }]);
  }

  function handleSave() {
    const parsedSets = sets
      .map((s) => ({
        kg: parseFloat(s.kg) || 0,
        reps: parseInt(s.reps, 10) || 0,
        unit,
      }))
      .filter((s) => s.kg > 0 || s.reps > 0);

    if (parsedSets.length === 0) {
      showToast('Add at least one set');
      return;
    }

    if (isEditing && params.logId) {
      updateLogAction(params.logId, parsedSets);
      const updatedLog = useStore.getState().logs.find((l) => l.id === params.logId);
      if (updatedLog) pushLog(updatedLog);
      showToast('Session updated');
    } else {
      const newLog = {
        id: Date.now().toString(),
        exerciseId: params.exId!,
        exerciseName: params.exName!,
        dayName: params.dayName!,
        date: Date.now(),
        sets: parsedSets,
      };
      addLogAction(newLog);
      pushLog(newLog);
      showToast('Session saved');
    }

    setUnit(unit);
    router.back();
  }

  function handleUnitToggle(newUnit: 'kg' | 'lbs') {
    setLocalUnit(newUnit);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.back}>{'\u2190'} BACK</Text>
          </Pressable>
        </View>

        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={120}
          enableOnAndroid
          enableResetScrollToCoords={false}
        >
          <Text style={styles.exerciseName}>{params.exName}</Text>
          <Text style={styles.meta}>
            {params.dayName} {'\u00B7'} {isEditing && editingLog ? formatDate(editingLog.date).toUpperCase() : todayHeader()}
          </Text>

          <UnitToggle unit={unit} onToggle={handleUnitToggle} />

          <View style={styles.setsHeader}>
            <Text style={styles.setsLabel}>SETS</Text>
          </View>

          {sets.map((set, i) => (
            <SetRow
              key={i}
              index={i}
              kg={set.kg}
              reps={set.reps}
              unit={unit}
              onChangeKg={(v) => updateSet(i, 'kg', v)}
              onChangeReps={(v) => updateSet(i, 'reps', v)}
              onDelete={() => deleteSet(i)}
            />
          ))}

          <Button
            title="+ Add Set"
            variant="outline"
            onPress={addSet}
            style={styles.addSetBtn}
          />

          <View style={styles.footer}>
            <Button
              title={isEditing ? 'Update Session' : 'Save Session'}
              onPress={handleSave}
            />
          </View>
        </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  back: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.accent,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  exerciseName: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    marginBottom: 4,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: spacing.xl,
  },
  setsHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  setsLabel: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  addSetBtn: {
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
