import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '../constants/theme';

interface ContextMenuOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  title: string;
  options: ContextMenuOption[];
  onClose: () => void;
}

export default function ContextMenu({ visible, title, options, onClose }: ContextMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menu}>
          <Text style={styles.title}>{title.toUpperCase()}</Text>
          {options.map((opt) => (
            <Pressable
              key={opt.label}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              onPress={() => {
                onClose();
                opt.onPress();
              }}
            >
              <Text style={[styles.optionText, opt.destructive && styles.destructiveText]}>
                {opt.destructive ? '\u2715' : '\u270E'} {opt.label.toUpperCase()}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.optionPressed]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  menu: {
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionPressed: {
    backgroundColor: 'rgba(108, 88, 76, 0.08)',
  },
  optionText: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.text,
    letterSpacing: 1,
  },
  destructiveText: {
    color: colors.danger,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
  },
});
