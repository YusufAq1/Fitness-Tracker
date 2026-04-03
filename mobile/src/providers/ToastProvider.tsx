import { createContext, useCallback, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../constants/theme';

interface ToastContextType {
  showToast: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback(
    (msg: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setMessage(msg.toUpperCase());
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
        ]).start();
      }, 2200);
    },
    [opacity, translateY],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View
        style={[styles.toast, { opacity, transform: [{ translateY }] }]}
        pointerEvents="none"
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: colors.text,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.full,
    zIndex: 9999,
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.bg,
    letterSpacing: 1,
  },
});
