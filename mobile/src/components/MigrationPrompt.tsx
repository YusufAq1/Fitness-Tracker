import { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isLoggedIn } from '../lib/auth';
import { fetchTemplates } from '../lib/db';
import { pushAllToCloud } from '../lib/sync';
import { useStore } from '../store/useStore';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';

const MIGRATION_KEY = 'overload_migrated';

export default function MigrationPrompt() {
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const days = useStore((s) => s.days);
  const logs = useStore((s) => s.logs);

  useEffect(() => {
    checkMigration();
  }, []);

  async function checkMigration() {
    if (!isLoggedIn()) return;

    const migrated = await AsyncStorage.getItem(MIGRATION_KEY);
    if (migrated) return;

    try {
      const cloudTemplates = await fetchTemplates();
      if (cloudTemplates && cloudTemplates.length > 0) {
        await AsyncStorage.setItem(MIGRATION_KEY, 'true');
        return;
      }
    } catch (_err) {
      return;
    }

    const hasLocalData =
      days.length > 0 && (logs.length > 0 || days.some((d) => d.exercises.length > 0));
    if (!hasLocalData) {
      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
      return;
    }

    setVisible(true);
  }

  async function handleUpload() {
    setUploading(true);
    try {
      await pushAllToCloud();
      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
      showToast('Data uploaded');
      setVisible(false);
    } catch (_err) {
      showToast('Upload failed');
      setUploading(false);
    }
  }

  async function handleSkip() {
    await AsyncStorage.setItem(MIGRATION_KEY, 'true');
    setVisible(false);
  }

  const message = `You have ${days.length} workout day${days.length !== 1 ? 's' : ''} and ${logs.length} session${logs.length !== 1 ? 's' : ''} on this device.\n\nUpload them to your account so they sync across all your devices?`;

  return (
    <ConfirmDialog
      visible={visible}
      title="Upload Local Data?"
      message={message}
      confirmLabel={uploading ? 'UPLOADING...' : 'UPLOAD'}
      cancelLabel="SKIP"
      onConfirm={handleUpload}
      onCancel={handleSkip}
    />
  );
}
