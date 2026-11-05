import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { AppText } from '@/components/ui';
import { photoCandidates } from '@/core/images';
import { colors, space } from '@/theme/tokens';

const MAX = 4;

/** One photo you can pinch or double-tap to zoom, and drag while zoomed. */
function ZoomPhoto({ uri, width, height, label, onZoomed }: { uri: string; width: number; height: number; label: string; onZoomed: (z: boolean) => void }) {
  const scale = useSharedValue(1);
  const start = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const clamp = (v: number, s: number, size: number) => {
    'worklet';
    const lim = ((s - 1) * size) / 2;
    return Math.min(lim, Math.max(-lim, v));
  };
  const reset = () => {
    'worklet';
    scale.value = withTiming(1); x.value = withTiming(0); y.value = withTiming(0);
    runOnJS(onZoomed)(false);
  };
  const pinch = Gesture.Pinch()
    .onStart(() => { start.value = scale.value; })
    .onUpdate((e) => { scale.value = Math.min(MAX, Math.max(1, start.value * e.scale)); })
    .onEnd(() => { if (scale.value <= 1.05) reset(); else runOnJS(onZoomed)(true); });
  const pan = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => { sx.value = x.value; sy.value = y.value; })
    .onUpdate((e) => {
      if (scale.value <= 1) return;
      x.value = clamp(sx.value + e.translationX, scale.value, width);
      y.value = clamp(sy.value + e.translationY, scale.value, height);
    });
  const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
    if (scale.value > 1) reset();
    else { scale.value = withTiming(2.5); runOnJS(onZoomed)(true); }
  });
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }] }));
  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
      <Animated.View style={[{ width, height }, style]}>
        <Image source={{ uri }} style={{ width, height }} contentFit="contain" accessibilityLabel={label} />
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Full-screen photos (website: PhotoGallery Viewer): sharp full-size photo, swipe to move,
 * pinch or double-tap to zoom, ✕ to close.
 */
export function PhotoViewer({ photos, title, index, onClose }: { photos: string[]; title: string; index: number; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const [at, setAt] = useState(index);
  const [zoomed, setZoomed] = useState(false);
  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaView style={styles.root}>
          <View style={styles.top}>
            <AppText variant="label" tone="onGreen">{photos.length > 1 ? `${at + 1} / ${photos.length}` : ''}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="Close photos" onPress={onClose} hitSlop={12} style={styles.close}>
              <AppText variant="heading" tone="onGreen">✕</AppText>
            </Pressable>
          </View>
          <FlatList
            data={photos}
            keyExtractor={(p, i) => `${i}-${p}`}
            horizontal
            pagingEnabled
            scrollEnabled={!zoomed}
            initialScrollIndex={index}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setAt(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item, index: i }) => (
              <View style={[styles.page, { width }]}>
                <ZoomPhoto uri={photoCandidates(item, false)[0] ?? item} width={width} height={height * 0.8}
                  label={`${title}, photo ${i + 1} of ${photos.length}`} onZoomed={setZoomed} />
              </View>
            )}
          />
          <AppText variant="caption" tone="onGreen" style={styles.hint}>Pinch or double-tap to zoom</AppText>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.text },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, height: 52 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { textAlign: 'center', paddingBottom: space.md, opacity: 0.8 },
});
