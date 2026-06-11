import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Text from '@/shared/ui/text';
import Animated, {
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

const AVATAR_COUNT = 8;

function ChevLeft() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M15 5l-7 7 7 7"
        fill="none"
        stroke={Brand.ink}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24">
      <Path
        d="M5 12.5 10 17l9-10"
        fill="none"
        stroke="#fff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ProfileSetupScreen() {
  const { top } = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveProfile } = useAuthStore();

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 55 }),
      withTiming(8, { duration: 55 }),
      withTiming(-6, { duration: 55 }),
      withTiming(6, { duration: 55 }),
      withTiming(0, { duration: 55 }),
    );
  };

  const [focused, setFocused] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('We need something to call you.');
      triggerShake();
      return;
    }
    if (name.length > 30) {
      setError('Keep it under 30 characters.');
      triggerShake();
      return;
    }
    setLoading(true);
    const err = await saveProfile(name, selected);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace('/(tabs)/home');
  };

  return (
    <View style={[styles.root, { paddingTop: top - 8 }]}>
      {/* Progress bar — full (last step of setup) */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <ChevLeft />
        </Pressable>

        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.subtitle}>
          This is how your friends will see you in their ripple chain.
        </Text>

        {/* Name input */}
        <Animated.View style={[styles.fieldWrap, shakeStyle]}>
          <View
            style={[
              styles.fieldBox,
              focused && styles.fieldBoxFocused,
              !!error && styles.fieldBoxError,
            ]}
          >
            <TextInput
              style={styles.fieldInput}
              value={name}
              onChangeText={(v) => { setName(v); setError(''); }}
              placeholder="Your first name"
              placeholderTextColor={Brand.muted}
              autoCapitalize="words"
              autoComplete="name"
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
          {!!error && <Text style={styles.fieldError}>{error}</Text>}
        </Animated.View>

        {/* Avatar picker */}
        <View style={styles.pickerSection}>
          <Text style={styles.sectionLabel}>PICK YOUR LOOK</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarRow}
          >
            {Array.from({ length: AVATAR_COUNT }).map((_, k) => (
              <Pressable
                key={k}
                onPress={() => setSelected(k)}
                style={styles.avatarBtn}
              >
                <Avatar index={k} size={58} ring={selected === k} />
                {selected === k && (
                  <View style={styles.checkBadge}>
                    <CheckIcon />
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.hint}>You can always change this later.</Text>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.footer}>
        <Pressable style={[styles.primaryBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.primaryBtnText}>{loading ? 'Saving…' : "Let's go"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.softBg,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Brand.border,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: Brand.blue,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Brand.ink,
    marginTop: 22,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15.5,
    color: Brand.sec,
    marginTop: 7,
    fontWeight: '600',
    lineHeight: 22,
  },
  fieldWrap: {
    marginTop: 26,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.card,
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 58,
  },
  fieldBoxFocused: {
    borderColor: Brand.blue,
  },
  fieldBoxError: {
    borderColor: Brand.danger,
  },
  fieldInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: Brand.ink,
  },
  fieldError: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.danger,
    marginTop: 6,
  },
  pickerSection: {
    marginTop: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Brand.muted,
  },
  avatarRow: {
    gap: 14,
    paddingVertical: 14,
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Brand.card,
  },
  hint: {
    fontSize: 12,
    color: Brand.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.blue,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});
