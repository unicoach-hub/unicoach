import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormError } from '@/components/FormError';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/TextField';
import { MAX_FILE_MB, sendFile, type ChatMessage, type PickedFile } from '@/lib/studentChat';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

const OK_EXT = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

type Props = {
  visible: boolean;
  // Answering a counsellor's request (title known), or a free upload where the student picks the type
  request: { id: string; title: string } | null;
  docTypes: string[];
  onClose: () => void;
  onSent: (msg: ChatMessage) => void;
};

// Bottom sheet: pick a PDF/photo or take a photo, say what it is, send it to the counsellor.
export function UploadSheet({ visible, request, docTypes, onClose, onSent }: Props) {
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [docType, setDocType] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setPicked(null);
    setDocType(null);
    setDocName('');
    setError(null);
    setBusy(false);
  }

  function close() {
    reset();
    onClose();
  }

  function accept(file: PickedFile) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!OK_EXT.includes(ext)) return setError('Sirf PDF, JPG, PNG ya WebP file bhej sakte ho.');
    if (file.size && file.size > MAX_FILE_MB * 1024 * 1024) return setError(`File bahut badi hai. ${MAX_FILE_MB} MB se chhoti bhejo.`);
    setError(null);
    setPicked(file);
  }

  async function fromFiles() {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    accept({ uri: a.uri, name: a.name, mimeType: a.mimeType, size: a.size, file: a.file });
  }

  async function fromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return setError('Camera ki permission chahiye. Settings mein allow karo.');
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    accept({ uri: a.uri, name: a.fileName ?? `photo_${Date.now()}.jpg`, mimeType: a.mimeType ?? 'image/jpeg', size: a.fileSize, file: a.file });
  }

  async function send() {
    if (!picked) return;
    if (!request && !docType) return setError('Chuno ye kaunsa document hai.');
    if (!request && docType === 'Other' && docName.trim().length < 2) return setError('Document ka naam likho.');
    setBusy(true);
    setError(null);
    try {
      const msg = await sendFile(picked, request ? { documentId: request.id } : { docType: docType!, docName: docName.trim() || undefined });
      onSent(msg);
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bhej nahi paaye.');
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Band karo" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.grab} />
        <AppText variant="kicker">{request ? 'Counsellor ne maanga' : 'Document bhejo'}</AppText>
        <AppText style={styles.title}>{request ? request.title : 'Kya bhejna hai?'}</AppText>

        {!picked ? (
          <View style={styles.sources}>
            <Source icon="external" title="Phone se file chuno" sub="PDF ya photo" onPress={fromFiles} />
            {Platform.OS !== 'web' && <Source icon="calendar" camera title="Camera se photo lo" sub="Passport, marksheet" onPress={fromCamera} />}
          </View>
        ) : (
          <View style={styles.picked}>
            <View style={styles.fileIcon}>
              <AppText style={styles.fileExt}>{picked.name.split('.').pop()?.toUpperCase()}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label" numberOfLines={1}>
                {picked.name}
              </AppText>
              {!!picked.size && <AppText variant="small">{(picked.size / 1024 / 1024).toFixed(1)} MB</AppText>}
            </View>
            <Pressable onPress={() => setPicked(null)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Doosri file chuno">
              <Icon name="close" size={18} color={colors.mutedDark} />
            </Pressable>
          </View>
        )}

        {!!picked && !request && (
          <View style={{ gap: 8 }}>
            <AppText variant="label">Ye kaunsa document hai?</AppText>
            <ScrollView style={{ maxHeight: 170 }} contentContainerStyle={styles.types}>
              {docTypes.map((t) => (
                <Pressable key={t} onPress={() => setDocType(t)} accessibilityRole="radio" accessibilityState={{ checked: docType === t }} style={[styles.type, docType === t && styles.typeOn]}>
                  <AppText style={[styles.typeText, docType === t && { color: colors.tealDark }]}>{t}</AppText>
                </Pressable>
              ))}
            </ScrollView>
            {docType === 'Other' && <TextField label="Naam" value={docName} onChangeText={setDocName} placeholder="Jaise Gap certificate" />}
          </View>
        )}

        <FormError message={error} />

        {!!picked && (busy ? <ActivityIndicator color={colors.teal} style={{ height: 56 }} /> : <Button title="Counsellor ko bhejo" icon={<Icon name="arrow" size={18} color={colors.cream} />} onPress={send} />)}
      </View>
    </Modal>
  );
}

function Source({ icon, title, sub, camera, onPress }: { icon: 'external' | 'calendar'; title: string; sub: string; camera?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.source}>
      <View style={[styles.sourceIcon, { backgroundColor: camera ? colors.tint.mustard : colors.tint.teal }]}>
        {camera ? <CameraGlyph /> : <Icon name={icon} size={20} color={colors.tealDark} />}
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={styles.sourceTitle}>{title}</AppText>
        <AppText variant="small">{sub}</AppText>
      </View>
      <Icon name="arrow" size={18} color={colors.muted} />
    </Pressable>
  );
}

function CameraGlyph() {
  return (
    <View style={{ width: 20, height: 16, borderRadius: 4, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, borderWidth: 2, borderColor: colors.ink }} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(22,19,15,0.4)' },
  sheet: { backgroundColor: colors.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: space.xl, paddingTop: 10, gap: 14 },
  grab: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.dashed, marginBottom: 4 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: colors.ink },
  sources: { gap: 10 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white },
  sourceIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sourceTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink },
  picked: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: border.width, borderColor: border.color },
  fileIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.tint.red, alignItems: 'center', justifyContent: 'center' },
  fileExt: { fontFamily: fonts.displayBlack, fontSize: 11, color: colors.red },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  type: { paddingHorizontal: 12, height: 36, borderRadius: radius.pill, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white, justifyContent: 'center' },
  typeOn: { backgroundColor: colors.tint.teal, borderColor: colors.teal },
  typeText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
});
