import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/components/ui';
import { colors, radius, size, type } from '@/theme/tokens';

/** Bottom bar: Home · Saved · Post Ad · Account (same 4 items as the website). */
function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return <Icon name={name} color={focused ? colors.green : colors.textSecondary} strokeWidth={focused ? 2 : 1.8} />;
}

function PostAdIcon() {
  return (
    <View style={{ width: 34, height: 26, borderRadius: radius.sm, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="plus" color={colors.onGreen} size={size.iconSmall} strokeWidth={2.4} />
    </View>
  );
}

export default function TabsLayout() {
  // Phones with on-screen buttons (|||  ○  <) draw them over the app: lift the bar above them.
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: type.tab,
        tabBarStyle: { height: size.tabBar + insets.bottom, paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: ({ focused }) => <TabIcon name="heart" focused={focused} /> }} />
      <Tabs.Screen name="post" options={{ title: 'Post Ad', tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: colors.green, tabBarIcon: () => <PostAdIcon /> }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} /> }} />
    </Tabs>
  );
}
