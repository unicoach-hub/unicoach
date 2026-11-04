import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormError } from '@/components/FormError';
import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/lib/auth';
import { COUNTRIES } from '@/lib/courses';
import { COURSES, EDUCATION, intakeOptions, MORE_COUNTRIES, saveProfile, type ProfileInput } from '@/lib/profile';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

const STEPS = 5;

// One question per screen, saved together at the end to PUT /student/profile (same as the website).
// Used for first-time onboarding and, with `editing`, from Profile → "Profile badlo".
export function ProfileWizard({ editing = false }: { editing?: boolean }) {
  const { user, updateUser, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileInput>({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    dreamCountry: user?.dreamCountry ?? '',
    preferredIntake: user?.preferredIntake ?? '',
    dreamCourse: user?.dreamCourse ?? '',
    highestEducation: user?.highestEducation ?? '',
    percentage: user?.percentage ?? '',
    passoutYear: user?.passoutYear ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const intakes = useMemo(() => intakeOptions(), []);

  const set = (key: keyof ProfileInput) => (value: string) => {
    setError(null);
    setForm((f) => ({ ...f, [key]: value }));
  };

  // What's missing on the current screen, in plain words (null = good to go)
  function problem(): string | null {
    if (step === 0 && !form.dreamCountry) return 'Ek desh chuno.';
    if (step === 1 && form.dreamCourse.trim().length < 2) return 'Course chuno ya likho.';
    if (step === 2 && !form.preferredIntake) return 'Intake chuno.';
    if (step === 3) {
      if (!form.highestEducation) return 'Apni padhai chuno.';
      const pct = Number(form.percentage.replace('%', ''));
      if (!Number.isFinite(pct) || pct <= 0 || pct > 100) return 'Percentage 1 se 100 ke beech daalo.';
      const year = Number(form.passoutYear);
      if (!/^\d{4}$/.test(form.passoutYear) || year < 1980 || year > new Date().getFullYear() + 6) return 'Sahi passout year daalo.';
    }
    if (step === 4) {
      if (form.name.trim().length < 2) return 'Apna naam likho.';
      if (form.phone.replace(/\D/g, '').length < 10) return 'Phone number 10 digit ka daalo.';
    }
    return null;
  }

  async function next() {
    const p = problem();
    if (p) {
      setError(p);
      return;
    }
    if (step < STEPS - 1) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      const phone = form.phone.replace(/\s/g, '');
      const saved = await saveProfile({ ...form, name: form.name.trim(), dreamCourse: form.dreamCourse.trim(), phone: phone.length === 10 ? `+91${phone}` : phone });
      // The root layout swaps to the tabs as soon as the profile counts as complete.
      updateUser({ ...saved, profileCompleted: true });
      if (editing) router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save nahi ho paaya. Dobara try karo.');
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          {/* First screen: a way out if they signed in with the wrong account. */}
          <Pressable
            onPress={() => {
              setError(null);
              if (step > 0) setStep(step - 1);
              else if (editing) router.back();
              else confirmLogout(user?.email, logout);
            }}
            accessibilityRole="button"
            accessibilityLabel={step > 0 || editing ? 'Pichhla sawaal' : 'Log out'}
            hitSlop={8}
            style={styles.back}>
            <Icon name={step > 0 || editing ? 'back' : 'logout'} size={18} />
          </Pressable>
          <View style={styles.segments}>
            {Array.from({ length: STEPS }).map((_, i) => (
              <View key={i} style={[styles.segment, i < step && styles.segmentDone, i === step && styles.segmentNow]} />
            ))}
          </View>
          <AppText style={styles.count}>
            {step + 1}/{STEPS}
          </AppText>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <Question kicker="Sawaal 1 · 1 minute ka kaam" title={['Kahan ', 'padhna', ' hai?']} hint="Isi desh ke courses, deadlines aur kharche aapko dikhenge.">
              <View style={styles.grid}>
                {COUNTRIES.map((c) => {
                  const on = form.dreamCountry === c.name;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => set('dreamCountry')(c.name)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      style={[styles.countryTile, { backgroundColor: on ? c.tint : colors.white }, on && styles.tileOn]}>
                      <Image source={c.image} style={{ width: 64, height: 58 }} contentFit="contain" />
                      <AppText style={styles.tileText}>{c.name}</AppText>
                    </Pressable>
                  );
                })}
              </View>
              <AppText variant="label" style={{ marginTop: 6 }}>
                Koi aur desh?
              </AppText>
              <View style={styles.wrap}>
                {MORE_COUNTRIES.map((c) => (
                  <Choice key={c} label={c} on={form.dreamCountry === c} onPress={() => set('dreamCountry')(c)} />
                ))}
              </View>
            </Question>
          )}

          {step === 1 && (
            <Question kicker="Sawaal 2" title={['Kya ', 'padhna', ' hai?']} hint="Ek chuno ya neeche khud likho. Baad mein badal sakte ho.">
              <View style={styles.wrap}>
                {COURSES.map((c) => (
                  <Choice key={c} label={c} on={form.dreamCourse === c} onPress={() => set('dreamCourse')(c)} />
                ))}
              </View>
              <TextField
                label="Kuch aur? Yahan likho"
                value={COURSES.includes(form.dreamCourse) ? '' : form.dreamCourse}
                onChangeText={set('dreamCourse')}
                placeholder="Jaise Psychology, Fashion Design"
                autoCapitalize="words"
              />
            </Question>
          )}

          {step === 2 && (
            <Question kicker="Sawaal 3" title={['Kab ', 'jaana', ' hai?']} hint="Intake matlab jis mahine class shuru hogi. Zyada tar log September chunte hain.">
              <View style={styles.grid3}>
                {intakes.map((i) => {
                  const [m, y] = i.split(' ');
                  const on = form.preferredIntake === i;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => set('preferredIntake')(i)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      style={[styles.intake, on && styles.intakeOn]}>
                      <AppText style={[styles.intakeMonth, on && { color: colors.cream }]}>{m.slice(0, 3)}</AppText>
                      <AppText style={[styles.intakeYear, on && { color: colors.cream }]}>{y}</AppText>
                    </Pressable>
                  );
                })}
              </View>
            </Question>
          )}

          {step === 3 && (
            <Question kicker="Sawaal 4" title={['Ab tak ki ', 'padhai', '']} hint="Isse pata chalega ki aapke liye Bachelors dikhayein ya Masters.">
              <View style={styles.wrap}>
                {EDUCATION.map((e) => (
                  <Choice key={e} label={e} on={form.highestEducation === e} onPress={() => set('highestEducation')(e)} />
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Percentage"
                    value={form.percentage}
                    onChangeText={set('percentage')}
                    placeholder="72"
                    keyboardType="decimal-pad"
                    maxLength={5}
                    hint="CGPA ho to × 9.5"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField label="Passout year" value={form.passoutYear} onChangeText={set('passoutYear')} placeholder="2025" keyboardType="number-pad" maxLength={4} />
                </View>
              </View>
            </Question>
          )}

          {step === 4 && (
            <Question kicker="Aakhri sawaal" title={['Counsellor kis ', 'number', ' pe call kare?']} hint="Sirf aapke counsellor ke liye. Koi spam nahi.">
              <TextField label="Naam" value={form.name} onChangeText={set('name')} placeholder="Riya Sharma" autoComplete="name" textContentType="name" />
              <TextField
                label="Phone"
                value={form.phone}
                onChangeText={set('phone')}
                placeholder="98765 43210"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={16}
              />
            </Question>
          )}

          <FormError message={error} />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={step === STEPS - 1 ? (editing ? 'Save karo' : 'Mera plan banao') : 'Aage badho'}
            loading={busy}
            loadingTitle="Plan bana rahe hain"
            icon={<Icon name="arrow" size={18} color={colors.cream} />}
            onPress={next}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function confirmLogout(email: string | undefined, logout: () => void) {
  const message = email ? `${email} se log out karna hai?` : 'Log out karna hai?';
  // Alert has no buttons on web, so the browser preview uses confirm()
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) logout();
    return;
  }
  Alert.alert('Account', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: logout },
  ]);
}

function Question({ kicker, title, hint, children }: { kicker: string; title: [string, string, string]; hint: string; children: ReactNode }) {
  return (
    <View style={{ gap: 18 }}>
      <View style={{ gap: 8 }}>
        <AppText variant="kicker">{kicker}</AppText>
        <AppText style={styles.title}>
          {title[0]}
          <Highlight>{title[1]}</Highlight>
          {title[2]}
        </AppText>
        <AppText variant="small" style={{ fontSize: 14, lineHeight: 20 }}>
          {hint}
        </AppText>
      </View>
      {children}
    </View>
  );
}

function Choice({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }} style={[styles.choice, on && styles.choiceOn]}>
      {on && <Icon name="check" size={14} color={colors.tealDark} strokeWidth={3} />}
      <AppText style={[styles.choiceText, on && { color: colors.tealDark }]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.sm },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segments: { flex: 1, flexDirection: 'row', gap: 5 },
  segment: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.divider },
  segmentDone: { backgroundColor: colors.teal },
  segmentNow: { backgroundColor: colors.mustard },
  count: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.mutedDark, minWidth: 28, textAlign: 'right' },
  body: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl, gap: space.lg },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  countryTile: {
    width: '31%',
    flexGrow: 1,
    height: 104,
    borderRadius: radius.md,
    borderWidth: border.width,
    borderColor: border.color,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tileOn: { borderColor: colors.teal, borderWidth: 2 },
  tileText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
  },
  choiceOn: { backgroundColor: colors.tint.teal, borderColor: colors.teal },
  choiceText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  grid3: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  intake: {
    width: '31%',
    flexGrow: 1,
    height: 72,
    borderRadius: radius.md,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intakeOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  intakeMonth: { fontFamily: fonts.displayBlack, fontSize: 20, color: colors.ink },
  intakeYear: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.mutedDark },
  footer: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.md },
});
