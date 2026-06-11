import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import Text from '@/shared/ui/text';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Brand } from '@/constants/theme';
import { Avatar } from '@/shared/ui/avatar';
import { useAuthStore } from '@/shared/stores/auth-store';

// ─── Constants ─────────────────────────────────────────────────

const AVATAR_COUNT = 8;
const INITIAL_NOTIF_ON = true;
const INITIAL_NOTIF_TIME = '9:00 AM';

const TIME_OPTIONS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM',
  '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',
  '3:00 PM', '5:00 PM', '7:00 PM', '9:00 PM',
];

// ─── Icons ─────────────────────────────────────────────────────

function ChevLeft() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" fill="none" stroke={Brand.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevRight({ color = Brand.muted }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M9 5l7 7-7 7" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24">
      <Path d="M5 12.5 10 17l9-10" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Section wrapper ───────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Time picker row ───────────────────────────────────────────

function TimePicker({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const height = useSharedValue(0);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    height.value = withTiming(next ? 120 : 0, {
      duration: 260,
      easing: Easing.out(Easing.ease),
    });
  };

  const select = (t: string) => {
    onChange(t);
    setOpen(false);
    height.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.ease) });
  };

  const gridStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: 'hidden',
  }));

  return (
    <>
      <Pressable style={styles.row} onPress={toggle}>
        <Text style={styles.rowLabel}>Remind me at</Text>
        <View style={styles.rowRight}>
          <Text style={[styles.rowValue, { color: Brand.blue }]}>{value}</Text>
          <ChevRight color={Brand.blue} />
        </View>
      </Pressable>

      <Animated.View style={gridStyle}>
        <View style={styles.timeGrid}>
          {TIME_OPTIONS.map((t) => (
            <Pressable
              key={t}
              style={[styles.timeChip, t === value && styles.timeChipSelected]}
              onPress={() => select(t)}
            >
              <Text style={[styles.timeChipText, t === value && styles.timeChipTextSelected]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </>
  );
}

// ─── Screen ────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { profile, signOut: authSignOut, saveProfile } = useAuthStore();

  const [name, setName] = useState(profile?.name ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar_index ?? 0);
  const [notifOn, setNotifOn] = useState(INITIAL_NOTIF_ON);
  const [notifTime, setNotifTime] = useState(INITIAL_NOTIF_TIME);
  const [nameError, setNameError] = useState('');
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  const dirty =
    name.trim() !== (profile?.name ?? '') ||
    avatar !== (profile?.avatar_index ?? 0) ||
    notifOn !== INITIAL_NOTIF_ON ||
    notifTime !== INITIAL_NOTIF_TIME;

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const shake = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 55 }),
      withTiming(8, { duration: 55 }),
      withTiming(-6, { duration: 55 }),
      withTiming(6, { duration: 55 }),
      withTiming(0, { duration: 55 }),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('We need something to call you.');
      shake();
      return;
    }
    if (name.length > 30) {
      setNameError('Keep it under 30 characters.');
      shake();
      return;
    }
    setSaving(true);
    const err = await saveProfile(name, avatar);
    setSaving(false);
    if (err) {
      setNameError(err);
      return;
    }
    router.back();
  };

  const handleSignOut = async () => {
    await authSignOut();
    router.replace('/onboarding' as never);
  };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <ChevLeft />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <Section label="PROFILE">
          {/* Name */}
          <Animated.View style={shakeStyle}>
            <View
              style={[
                styles.fieldBox,
                focused && styles.fieldBoxFocused,
                !!nameError && styles.fieldBoxError,
              ]}
            >
              <TextInput
                style={styles.fieldInput}
                value={name}
                onChangeText={(v) => { setName(v); setNameError(''); }}
                placeholder="Your first name"
                placeholderTextColor={Brand.muted}
                autoCapitalize="words"
                autoComplete="name"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </View>
            {!!nameError && <Text style={styles.fieldError}>{nameError}</Text>}
          </Animated.View>

          <Divider />

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Text style={styles.avatarLabel}>PICK YOUR LOOK</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarRow}
            >
              {Array.from({ length: AVATAR_COUNT }).map((_, k) => (
                <Pressable key={k} onPress={() => setAvatar(k)} style={styles.avatarBtn}>
                  <Avatar index={k} size={52} ring={avatar === k} />
                  {avatar === k && (
                    <View style={styles.checkBadge}>
                      <CheckIcon />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Section>

        {/* Notifications */}
        <Section label="NOTIFICATIONS">
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Daily reminder</Text>
            <Switch
              value={notifOn}
              onValueChange={setNotifOn}
              trackColor={{ true: Brand.blue, false: Brand.border }}
              thumbColor={Platform.OS === 'android' ? (notifOn ? '#fff' : Brand.muted) : undefined}
            />
          </View>

          {notifOn && (
            <>
              <Divider />
              <TimePicker value={notifTime} onChange={setNotifTime} />
            </>
          )}
        </Section>

        {/* Account */}
        <Section label="ACCOUNT">
          <Pressable style={styles.row} onPress={handleSignOut}>
            <Text style={[styles.rowLabel, { color: Brand.danger }]}>Sign out</Text>
            <ChevRight color={Brand.danger} />
          </Pressable>
        </Section>
      </ScrollView>

      {/* Sticky save button */}
      {dirty && (
        <View style={[styles.footer, { paddingBottom: bottom + 16 }]}>
          <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save changes'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.softBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
    backgroundColor: Brand.card,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.softBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Brand.ink,
    letterSpacing: -0.2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  // Section
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Brand.muted,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Brand.border,
    marginHorizontal: -16,
  },
  // Name field
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 0,
  },
  fieldBoxFocused: {
    // highlight handled by border on parent card
  },
  fieldBoxError: {},
  fieldInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: Brand.ink,
  },
  fieldError: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.danger,
    marginBottom: 6,
  },
  // Avatar picker
  avatarSection: {
    paddingVertical: 14,
  },
  avatarLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: Brand.muted,
    marginBottom: 12,
  },
  avatarRow: {
    gap: 12,
    paddingHorizontal: 2,
  },
  avatarBtn: {
    position: 'relative',
    padding: 2,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Brand.card,
  },
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.ink,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  // Time grid
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 16,
    paddingTop: 4,
  },
  timeChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.softBg,
  },
  timeChipSelected: {
    borderColor: Brand.blue,
    backgroundColor: `${Brand.blue}14`,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.sec,
  },
  timeChipTextSelected: {
    color: Brand.blue,
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    backgroundColor: Brand.card,
  },
  saveBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.blue,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
