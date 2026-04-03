import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const TAB_COLORS = {
  active: '#6c584c',
  inactive: '#a98467',
  bg: '#f0ead2',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_COLORS.bg,
          borderTopColor: '#c8c0a8',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: TAB_COLORS.active,
        tabBarInactiveTintColor: TAB_COLORS.inactive,
        tabBarLabelStyle: {
          fontFamily: 'DMMono_400Regular',
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💪</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏆</Text>
          ),
        }}
      />
    </Tabs>
  );
}
