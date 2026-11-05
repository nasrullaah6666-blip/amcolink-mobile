import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppText, Button } from '@/components/ui';
import { Photo } from '@/components/Photo';
import { Loading } from '@/components/States';
import { uploadAdPhoto } from '@/api/photos';
import { colors, radius, space } from '@/theme/tokens';

const MAX_PHOTOS = 6;

/**
 * Listing photos: add from camera or gallery (uploaded right away in the website's format), remove, keep order.
 * Removing here only takes the photo off the list; the file is deleted when the change is saved.
 */
export function PhotoEditor({ userId, photos, onChange, onError }: { userId: string; photos: string[]; onChange: (p: string[]) => void; onError: (msg: string) => void }) {
  const [uploading, setUploading] = useState(0);
  async function add(fromCamera: boolean) {
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) return;
    const perm = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { onError(fromCamera ? 'Allow the camera to take a photo.' : 'Allow access to your photos to add one.'); return; }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: room, quality: 1 });
    if (res.canceled) return;
    const picked = res.assets.slice(0, room);
    setUploading((n) => n + picked.length);
    let list = photos;
    for (const a of picked) {
      try {
        const url = await uploadAdPhoto(userId, { uri: a.uri, width: a.width, height: a.height });
        list = [...list, url].slice(0, MAX_PHOTOS);
        onChange(list);
      } catch (e) { onError((e as Error).message || 'Upload failed.'); } finally { setUploading((n) => n - 1); }
    }
  }
  return (
    <View style={styles.wrap}>
      <View style={styles.photos}>
        {photos.map((u, i) => (
          <View key={u}>
            <Photo src={u} thumb style={styles.photo} label={`Photo ${i + 1}`} />
            <Pressable accessibilityRole="button" accessibilityLabel={`Remove photo ${i + 1}`} onPress={() => onChange(photos.filter((x) => x !== u))} style={styles.remove}>
              <AppText variant="label">✕</AppText>
            </Pressable>
          </View>
        ))}
        {Array.from({ length: uploading }).map((_, i) => <View key={`u${i}`} style={[styles.photo, styles.wait]}><Loading label="" /></View>)}
      </View>
      {photos.length + uploading < MAX_PHOTOS ? (
        <View style={styles.row}>
          <Button style={styles.flex} title="Take photo" variant="outline" onPress={() => add(true)} />
          <Button style={styles.flex} title="Choose photos" variant="outline" onPress={() => add(false)} />
        </View>
      ) : null}
      {uploading > 0 ? <AppText variant="caption" tone="secondary">Uploading…</AppText> : null}
    </View>
  );
}


const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  photo: { width: 96, height: 96, borderRadius: radius.md },
  wait: { backgroundColor: colors.placeholder, justifyContent: 'center' },
  remove: { position: 'absolute', top: -6, right: -6, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
});
