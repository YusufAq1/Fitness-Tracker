import { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../constants/theme';

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
}

export default function SwipeableRow({
  children,
  onEdit,
  onDelete,
  editLabel = 'Edit',
}: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  function close() {
    swipeableRef.current?.close();
  }

  function renderRightActions(
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) {
    const translateX = dragX.interpolate({
      inputRange: [-140, 0],
      outputRange: [0, 140],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.actionsContainer, { transform: [{ translateX }] }]}>
        <Pressable
          style={styles.editAction}
          onPress={() => {
            close();
            onEdit();
          }}
        >
          <Feather name="edit-2" size={18} color={colors.white} />
          <Text style={styles.actionLabel}>{editLabel.toUpperCase()}</Text>
        </Pressable>
        <Pressable
          style={styles.deleteAction}
          onPress={() => {
            close();
            onDelete();
          }}
        >
          <Feather name="trash-2" size={18} color={colors.white} />
          <Text style={styles.actionLabel}>DELETE</Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    width: 140,
  },
  editAction: {
    flex: 1,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteAction: {
    flex: 1,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
