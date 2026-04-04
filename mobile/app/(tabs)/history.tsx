import { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { removeLog } from '../../src/lib/sync';
import { useToast } from '../../src/hooks/useToast';
import { getPersonalRecords, isPersonalRecord } from '../../src/utils/records';
import { colors, fonts, spacing } from '../../src/constants/theme';
import HistoryEntry from '../../src/components/HistoryEntry';
import Chip from '../../src/components/Chip';
import EmptyState from '../../src/components/EmptyState';
import ConfirmDialog from '../../src/components/ConfirmDialog';
import DrawerToggle from '../../src/components/DrawerToggle';
import type { Log } from '../../src/types';

export default function HistoryScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const logs = useStore((s) => s.logs);
  const deleteLogAction = useStore((s) => s.deleteLog);
  const [filter, setFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const prs = useMemo(() => getPersonalRecords(logs), [logs]);

  const exerciseNames = useMemo(() => {
    const names = new Set(logs.map((l) => l.exerciseName));
    return ['ALL', ...Array.from(names).sort()];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => b.date - a.date);
    if (filter === 'ALL') return sorted;
    return sorted.filter((l) => l.exerciseName === filter);
  }, [logs, filter]);

  function getPrevLog(exerciseId: string, beforeDate: number): Log | null {
    return logs
      .filter((l) => l.exerciseId === exerciseId && l.date < beforeDate)
      .sort((a, b) => b.date - a.date)[0] ?? null;
  }

  const handleEdit = useCallback((log: Log) => {
    router.push({
      pathname: '/log',
      params: {
        dayId: '',
        exId: log.exerciseId,
        exName: log.exerciseName,
        dayName: log.dayName,
        logId: log.id,
      },
    });
  }, [router]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteLogAction(deleteTarget);
    removeLog(deleteTarget);
    showToast('Session deleted');
    setDeleteTarget(null);
  }, [deleteTarget, deleteLogAction, showToast]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <DrawerToggle />
          <Text style={styles.title}>HISTORY</Text>
        </View>
      </View>

      {logs.length > 0 && (
        <View style={styles.chipContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {exerciseNames.map((name) => (
              <Chip
                key={name}
                label={name}
                active={filter === name}
                onPress={() => setFilter(name)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No history yet — log a session to get started" />}
        renderItem={({ item }) => (
          <HistoryEntry
            log={item}
            isPR={isPersonalRecord(item, prs)}
            prevLog={getPrevLog(item.exerciseId, item.date)}
            onEdit={() => handleEdit(item)}
            onDelete={() => setDeleteTarget(item.id)}
          />
        )}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Session"
        message="This action cannot be undone."
        confirmLabel="DELETE"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.accent,
    letterSpacing: 2,
  },
  chipContainer: {
    paddingBottom: spacing.md,
  },
  chips: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
});
