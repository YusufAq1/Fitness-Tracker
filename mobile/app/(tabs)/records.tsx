import { useMemo } from 'react';
import { Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/useStore';
import { getPersonalRecords } from '../../src/utils/records';
import { colors, fonts, spacing } from '../../src/constants/theme';
import RecordCard from '../../src/components/RecordCard';
import EmptyState from '../../src/components/EmptyState';
import type { PersonalRecord } from '../../src/types';

interface RecordWithCount extends PersonalRecord {
  sessionCount: number;
}

export default function RecordsScreen() {
  const logs = useStore((s) => s.logs);

  const records = useMemo(() => {
    const prs = getPersonalRecords(logs);
    const list: RecordWithCount[] = Object.values(prs)
      .map((pr) => ({
        ...pr,
        sessionCount: logs.filter((l) => l.exerciseName === pr.exerciseName).length,
      }))
      .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
    return list;
  }, [logs]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>RECORDS</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.logId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No records yet — log a session to set your first PR" />}
        renderItem={({ item }) => (
          <RecordCard record={item} sessionCount={item.sessionCount} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.accent,
    letterSpacing: 2,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
});
