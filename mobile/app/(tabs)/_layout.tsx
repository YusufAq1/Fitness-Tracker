import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';

const TAB_COLORS = {
  active: '#6c584c',
  inactive: '#a98467',
  bg: '#f0ead2',
  activeBg: 'rgba(108, 88, 76, 0.12)',
  border: '#c8c0a8',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_COLORS.bg,
          borderTopColor: TAB_COLORS.border,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 6,
          height: 52,
          paddingHorizontal: 12,
        },
        tabBarActiveTintColor: TAB_COLORS.active,
        tabBarInactiveTintColor: TAB_COLORS.inactive,
        tabBarShowLabel: true,
        tabBarIconStyle: { display: 'none' },
        tabBarItemStyle: {
          borderRadius: 8,
          marginHorizontal: 4,
          paddingVertical: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMMono_500Medium',
          fontSize: 12,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workouts',
          tabBarIcon: () => null,
          tabBarActiveBackgroundColor: TAB_COLORS.activeBg,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: () => null,
          tabBarActiveBackgroundColor: TAB_COLORS.activeBg,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: () => null,
          tabBarActiveBackgroundColor: TAB_COLORS.activeBg,
        }}
      />
    </Tabs>
  );
}
