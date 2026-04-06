import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../../src/constants/theme';

const DRAWER_COLORS = {
  active: colors.accent,
  inactive: colors.muted,
  bg: colors.bg,
  activeBg: 'rgba(204, 164, 59, 0.12)',
};

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: DRAWER_COLORS.bg,
            width: 260,
          },
          drawerActiveTintColor: DRAWER_COLORS.active,
          drawerInactiveTintColor: DRAWER_COLORS.inactive,
          drawerActiveBackgroundColor: DRAWER_COLORS.activeBg,
          drawerLabelStyle: {
            fontFamily: 'DMMono_500Medium',
            fontSize: 13,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          },
          drawerItemStyle: {
            borderRadius: 8,
            marginHorizontal: 8,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{ title: 'Workouts', drawerLabel: 'Workouts' }}
        />
        <Drawer.Screen
          name="history"
          options={{ title: 'History', drawerLabel: 'History' }}
        />
        <Drawer.Screen
          name="records"
          options={{ title: 'Records', drawerLabel: 'Records' }}
        />
        <Drawer.Screen
          name="profile"
          options={{ title: 'Profile', drawerLabel: 'Profile' }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
