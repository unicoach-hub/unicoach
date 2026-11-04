import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UploadSheet } from '@/components/chat/UploadSheet';
import { FormError } from '@/components/FormError';
import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { SITE } from '@/lib/feed';
import { documentLink, loadMyFile, sendText, STATUS_LABEL, type ChatMessage, type MyFile, type StudentDoc } from '@/lib/studentChat';
import { useTabBarSpace } from '@/lib/useTabBarSpace';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

type Mode = 'chat' | 'docs';
const POLL_MS = 20000;

// Counsellor chat + documents: the website dashboard's "Messages & Documents", on the phone.
export default function Chat() {
  const bottom = useTabBarSpace();
  const [file, setFile] = useState<MyFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('chat');
  // "Counsellor se poochho" on a course opens this tab with a ready message (?draft=...)
  const { draft } = useLocalSearchParams<{ draft?: string }>();
  const [text, setText] = useState(draft ?? '');
  const [usedDraft, setUsedDraft] = useState(draft);
  if (draft && draft !== usedDraft) {
    setUsedDraft(draft);
    setText(draft);
  }
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ open: boolean; request: { id: string; title: string } | null }>({ open: false, request: null });
  const [refreshing, setRefreshing] = useState(false);
  const list = useRef<FlatList<ChatMessage>>(null);

  const load = useCallback(async () => {
    try {
      setFile(await loadMyFile());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chat load nahi hui.');
    }
  }, []);

  // Load when the tab opens and keep checking for counsellor replies while it's open
  useFocusEffect(
    useCallback(() => {
      load();
      const t = setInterval(load, POLL_MS);
      return () => clearInterval(t);
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const append = useCallback((msg: ChatMessage) => {
    setFile((f) => {
      if (!f) return f;
      const docs = msg.document ? [msg.document, ...f.documents.filter((d) => d._id !== msg.document!._id)] : f.documents;
      return { ...f, messages: [...f.messages, msg], documents: docs };
    });
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  async function send() {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setSendError(null);
    try {
      append(await sendText(t));
      setText('');
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Message nahi gaya.');
    } finally {
      setSending(false);
    }
  }

  const pending = (file?.documents ?? []).filter((d) => d.status === 'requested' || d.status === 'reupload');
  const counsellor = file?.counselor;

  const header = (
    <View style={styles.header}>
      <View style={styles.who}>
        {counsellor?.avatar ? (
          <Image source={{ uri: counsellor.avatar }} style={styles.avatar} contentFit="cover" />
        ) : (
          <Image source={require('@/assets/images/counsellor.webp')} style={styles.avatar} contentFit="cover" />
        )}
        <View style={{ flex: 1 }}>
          <AppText variant="kicker">{counsellor ? counsellor.title || 'Aapka counsellor' : 'UniCoach team'}</AppText>
          <AppText style={styles.name} numberOfLines={1}>
            {counsellor?.name ?? 'Counsellor se baat'}
          </AppText>
        </View>
        <Pressable onPress={() => WebBrowser.openBrowserAsync(`${SITE}/book-consultation`)} accessibilityRole="button" style={styles.callBtn}>
          <AppText style={styles.callText}>Call book</AppText>
        </Pressable>
      </View>

      <View style={styles.switch}>
        {(
          [
            ['chat', 'Chat'],
            ['docs', `Documents (${file?.documents.length ?? 0})`],
          ] as const
        ).map(([m, label]) => (
          <Pressable key={m} onPress={() => setMode(m)} accessibilityRole="tab" accessibilityState={{ selected: mode === m }} style={[styles.half, mode === m && styles.halfOn]}>
            <AppText style={[styles.switchText, mode === m && { color: colors.ink }]}>{label}</AppText>
          </Pressable>
        ))}
      </View>

      {pending.length > 0 && (
        <View style={styles.pending}>
          <AppText style={styles.pendingTitle}>
            Counsellor ne <Highlight>{`${pending.length} document`}</Highlight> maange hain
          </AppText>
          {pending.map((d) => (
            <View key={d._id} style={styles.pendingRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="label">{d.title}</AppText>
                {!!d.note && (
                  <AppText variant="small" numberOfLines={2}>
                    {d.note}
                  </AppText>
                )}
              </View>
              <Button title="Upload" size="sm" variant="dark" onPress={() => setSheet({ open: true, request: { id: d._id, title: d.title } })} />
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (!file) {
    return (
      <SafeAreaView edges={['top']} style={styles.page}>
        <View style={[styles.body, { paddingBottom: bottom }]}>
          {error ? (
            <View style={styles.empty}>
              <AppText variant="bodyStrong">{error}</AppText>
              <Button title="Dobara try karo" variant="secondary" onPress={load} />
            </View>
          ) : (
            <SkeletonGroup>
              <View style={{ gap: 12 }}>
                <Skeleton height={60} radius={20} />
                <Skeleton height={44} radius={22} />
                <Skeleton height={80} radius={20} width="70%" />
                <Skeleton height={60} radius={20} width="60%" />
              </View>
            </SkeletonGroup>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {mode === 'chat' ? (
          <>
            <FlatList
              ref={list}
              data={file.messages}
              keyExtractor={(m) => m._id}
              ListHeaderComponent={header}
              ListEmptyComponent={
                <View style={styles.hello}>
                  <AppText style={styles.helloTitle}>Namaste! Kuch bhi poochho</AppText>
                  <AppText variant="small" style={{ textAlign: 'center' }}>
                    Course, fees, documents ya visa. Aapka counsellor yahin jawab dega.
                  </AppText>
                </View>
              }
              renderItem={({ item }) => <Bubble msg={item} onUpload={(d) => setSheet({ open: true, request: { id: d._id, title: d.title } })} />}
              contentContainerStyle={styles.list}
              onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} colors={[colors.teal]} />}
              keyboardShouldPersistTaps="handled"
            />
            <View style={[styles.composer, { marginBottom: bottom - 8 }]}>
              <FormError message={sendError} />
              <View style={styles.composerRow}>
                <Pressable onPress={() => setSheet({ open: true, request: null })} accessibilityRole="button" accessibilityLabel="Document bhejo" style={styles.attach}>
                  <AppText style={styles.plus}>+</AppText>
                </Pressable>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Message likho…"
                  placeholderTextColor={colors.muted}
                  multiline
                  accessibilityLabel="Message"
                  style={styles.input}
                />
                <Pressable
                  onPress={send}
                  disabled={!text.trim() || sending}
                  accessibilityRole="button"
                  accessibilityLabel="Bhejo"
                  style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.4 }]}>
                  {sending ? <ActivityIndicator color={colors.cream} /> : <Icon name="arrow" size={20} color={colors.cream} />}
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.list, { paddingBottom: bottom }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} colors={[colors.teal]} />}>
            {header}
            <Button title="Naya document bhejo" variant="secondary" icon={<AppText style={[styles.plus, { color: colors.ink }]}>+</AppText>} onPress={() => setSheet({ open: true, request: null })} />
            {file.documents.length === 0 ? (
              <View style={styles.empty}>
                <AppText variant="bodyStrong">Abhi koi document nahi</AppText>
                <AppText>Passport, marksheets, IELTS scorecard yahan bhejo. Sab ek jagah safe rahega.</AppText>
              </View>
            ) : (
              file.documents.map((d) => <DocRow key={d._id} doc={d} onUpload={() => setSheet({ open: true, request: { id: d._id, title: d.title } })} />)
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <UploadSheet
        visible={sheet.open}
        request={sheet.request}
        docTypes={file.docTypes}
        onClose={() => setSheet({ open: false, request: null })}
        onSent={(msg) => {
          append(msg);
          load();
        }}
      />
    </SafeAreaView>
  );
}

async function openDoc(id: string) {
  try {
    await WebBrowser.openBrowserAsync(await documentLink(id));
  } catch {
    // The link is short-lived; a failed open just does nothing visible
  }
}

function Bubble({ msg, onUpload }: { msg: ChatMessage; onUpload: (d: StudentDoc) => void }) {
  const mine = msg.senderType === 'student';
  const time = new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

  if (msg.kind === 'request') {
    return (
      <View style={styles.requestCard}>
        <AppText variant="kicker">{msg.senderName || 'Counsellor'} ne maanga</AppText>
        <AppText style={styles.requestTitle}>{(msg.requestTitles ?? []).join(', ') || msg.text}</AppText>
        {!!msg.text && msg.requestTitles?.length ? <AppText variant="small">{msg.text}</AppText> : null}
        {msg.document && (msg.document.status === 'requested' || msg.document.status === 'reupload') && (
          <Button title="Abhi upload karo" size="sm" variant="dark" onPress={() => onUpload(msg.document!)} />
        )}
        <AppText style={styles.time}>{time}</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleWrap, mine ? styles.right : styles.left]}>
      {!mine && !!msg.senderName && <AppText style={styles.sender}>{msg.senderName}</AppText>}
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {msg.kind === 'file' && msg.document ? (
          <Pressable onPress={() => openDoc(msg.document!._id)} accessibilityRole="link" style={styles.fileChip}>
            <View style={styles.fileIcon}>
              <AppText style={styles.fileExt}>{msg.document.file?.name.split('.').pop()?.toUpperCase() ?? 'DOC'}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.fileName, mine && { color: colors.cream }]} numberOfLines={1}>
                {msg.document.title}
              </AppText>
              <AppText style={[styles.fileSub, mine && { color: colors.cream, opacity: 0.8 }]}>{STATUS_LABEL[msg.document.status].label}</AppText>
            </View>
          </Pressable>
        ) : (
          <AppText style={[styles.msgText, mine && { color: colors.cream }]}>{msg.text}</AppText>
        )}
      </View>
      <AppText style={[styles.time, mine && { textAlign: 'right' }]}>{time}</AppText>
    </View>
  );
}

function DocRow({ doc, onUpload }: { doc: StudentDoc; onUpload: () => void }) {
  const s = STATUS_LABEL[doc.status];
  const needsUpload = doc.status === 'requested' || doc.status === 'reupload';
  return (
    <View style={styles.docRow}>
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="label" style={{ fontSize: 15 }}>
          {doc.title}
        </AppText>
        <View style={[styles.status, { backgroundColor: s.bg }]}>
          <AppText style={[styles.statusText, { color: s.fg }]}>{s.label}</AppText>
        </View>
        {!!doc.note && <AppText variant="small">{doc.note}</AppText>}
      </View>
      {needsUpload ? (
        <Button title="Upload" size="sm" variant="dark" onPress={onUpload} />
      ) : doc.file ? (
        <Pressable onPress={() => openDoc(doc._id)} accessibilityRole="link" hitSlop={8} style={styles.view}>
          <AppText style={styles.viewText}>Dekho</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  body: { flex: 1, paddingHorizontal: space.xl, paddingTop: space.md },
  header: { gap: 12, marginBottom: 8 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { fontFamily: fonts.display, fontSize: 20, lineHeight: 25, color: colors.ink },
  callBtn: { height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.tint.teal, justifyContent: 'center' },
  callText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.tealDark },
  switch: { flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: colors.sand },
  half: { flex: 1, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  halfOn: { backgroundColor: colors.white },
  switchText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.mutedDark },
  pending: { padding: 14, gap: 10, borderRadius: radius.lg, backgroundColor: colors.tint.mustard },
  pendingTitle: { fontFamily: fonts.display, fontSize: 16, lineHeight: 22, color: colors.ink },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  list: { paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.lg, gap: 10 },
  hello: { alignItems: 'center', gap: 6, paddingVertical: space.xxl },
  helloTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  bubbleWrap: { maxWidth: '82%', gap: 3 },
  left: { alignSelf: 'flex-start' },
  right: { alignSelf: 'flex-end' },
  sender: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.mutedDark, marginLeft: 6 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine: { backgroundColor: colors.teal, borderBottomRightRadius: 6 },
  bubbleTheirs: { backgroundColor: colors.white, borderWidth: border.width, borderColor: border.color, borderBottomLeftRadius: 6 },
  msgText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.ink },
  time: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginHorizontal: 6 },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 180 },
  fileIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.tint.red, alignItems: 'center', justifyContent: 'center' },
  fileExt: { fontFamily: fonts.displayBlack, fontSize: 10, color: colors.red },
  fileName: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  fileSub: { fontFamily: fonts.body, fontSize: 12, color: colors.mutedDark },
  requestCard: { alignSelf: 'stretch', padding: 14, gap: 8, borderRadius: radius.lg, backgroundColor: colors.tint.mustard },
  requestTitle: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22, color: colors.ink },
  composer: { paddingHorizontal: space.lg, paddingTop: 8, gap: 6, backgroundColor: colors.cream },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  attach: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, borderWidth: border.width, borderColor: border.color, alignItems: 'center', justifyContent: 'center' },
  plus: { fontFamily: fonts.display, fontSize: 24, lineHeight: 26, color: colors.teal },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 11,
    borderRadius: 22,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: space.lg, gap: space.md, borderRadius: radius.lg, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white },
  status: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  statusText: { fontFamily: fonts.bodySemi, fontSize: 11 },
  view: { paddingHorizontal: 12, height: 36, borderRadius: 18, backgroundColor: colors.tint.teal, justifyContent: 'center' },
  viewText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.tealDark },
});
