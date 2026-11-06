import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/components/ui';
import { colors, radius, size, type } from '@/theme/tokens';
import { useDropDot } from '@/lib/priceDrops';
import { barsHidden } from '@/lib/scrollBars';

/** Bottom bar: Home · Saved · Post Ad · Account (same 4 items as the website). */
function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return <Icon name={name} color={focused ? colors.green : colors.textSecondary} strokeWidth={focused ? 2 : 1.8} />;
}

/** Saved heart with a dot when a saved item got cheaper since Saved was last opened (website: DropDot). */
function SavedIcon({ focused }: { focused: boolean }) {
  const dot = useDropDot();
  return (
    <View accessibilityLabel={dot ? 'Saved, a saved item is cheaper now' : undefined}>
      <TabIcon name="heart" focused={focused} />
      {dot ? <View style={{ position: 'absolute', top: -2, right: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green, borderWidth: 2, borderColor: colors.surface }} /> : null}
    </View>
  );
}

function PostAdIcon() {
  return (
    <View style={{ width: 34, height: 26, borderRadius: radius.sm, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="plus" color={colors.onGreen} size={size.iconSmall} strokeWidth={2.4} />
    </View>
  );
}

/**
 * The bar slides away while scrolling down a tab's list and comes back when scrolling up (website: ScrollChrome).
 * The strip over the phone's own buttons (|||  ○  <) always stays, so nothing is drawn under them.
 */
function HidingTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const slide = useAnimatedStyle(() => ({ height: withTiming(barsHidden.value ? 0 : size.tabBar, { duration: 200 }) }));
  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Animated.View style={[{ overflow: 'hidden', justifyContent: 'flex-start' }, slide]}>
        <BottomTabBar {...props} />
      </Animated.View>
      <View style={{ height: insets.bottom }} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <HidingTabBar {...props} />}
      safeAreaInsets={{ bottom: 0 }}
      // A new tab always starts with the bar showing.
      screenListeners={{ focus: () => { barsHidden.value = 0; } }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: type.tab,
        tabBarStyle: { height: size.tabBar, paddingBottom: 0, backgroundColor: colors.surface, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: ({ focused }) => <SavedIcon focused={focused} /> }} />
      <Tabs.Screen name="post" options={{ title: 'Post Ad', tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: colors.green, tabBarIcon: () => <PostAdIcon /> }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} /> }} />
    </Tabs>
  );
}
