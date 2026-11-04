import React, { useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Photo } from '@/components/Photo';
import { colors, space } from '@/theme/tokens';

/** Swipeable photos for a listing, with dots. Full photos here (thumbnails are for lists). */
export function PhotoPager({ photos, title }: { photos: string[]; title: string }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const height = Math.round((width * 3) / 4);
  if (!photos.length) return <Photo src={null} style={{ width, height }} label={title} />;
  return (
    <View>
      <FlatList
        data={photos}
        keyExtractor={(p, i) => `${i}-${p}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index: i }) => (
          <Photo src={item} style={{ width, height }} label={`${title}, photo ${i + 1} of ${photos.length}`} />
        )}
      />
      {photos.length > 1 ? (
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {photos.map((p, i) => (
            <View key={`${i}-${p}`} style={[styles.dot, i === index && styles.dotOn]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { position: 'absolute', bottom: space.sm + 2, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.overlay },
  dotOn: { width: 18, backgroundColor: colors.green },
});
