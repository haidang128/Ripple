import Svg, { Path } from 'react-native-svg';
import { Tabs } from 'expo-router';
import { Brand } from '@/constants/theme';

import type { ColorValue } from 'react-native';

function HomeIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      {focused ? (
        <Path
          fill={color}
          d="M4 11.5 12 4l8 7.5V19a1 1 0 0 1-1 1h-3v-6h-6v6H5a1 1 0 0 1-1-1Z"
        />
      ) : (
        <Path
          d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

function ProfileIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      {focused ? (
        <>
          <Path fill={color} d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
          <Path fill={color} d="M4.5 20.5c0-4 3.5-6.8 7.5-6.8s7.5 2.8 7.5 6.8Z" />
        </>
      ) : (
        <>
          <Path
            d="M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
          <Path
            d="M4.5 20c0-4 3.5-6.5 7.5-6.5S19.5 16 19.5 20"
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.blue,
        tabBarInactiveTintColor: Brand.muted,
        tabBarStyle: {
          borderTopColor: Brand.border,
          backgroundColor: 'rgba(255,255,255,0.92)',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
