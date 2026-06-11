import { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Text from '@/shared/ui/text';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '@/constants/theme';
import { Avatar } from '@/shared/ui/avatar';
import { getActionById } from '@/shared/data/actions';
import { useDeepLinkStore } from '@/shared/stores/deep-link-store';

const LEVEL_LABEL: Record<string, string> = {
  SEED: 'Level 1 — Seed',
  SPARK: 'Level 2 — Spark',
  WAVE: 'Level 3 — Wave',
};

// ─── Parse slug ────────────────────────────────────────────────
// Format: {encodedName}__{actionId}  e.g. "Hai__thank-someone"

function parseSlug(slug: string): { inviterName: string; actionId: string } {
  const sep = '__';
  const idx = slug.indexOf(sep);
  if (idx === -1) return { inviterName: 'Someone', actionId: 'thank-someone' };
  return {
    inviterName: decodeURIComponent(slug.slice(0, idx)) || 'Someone',
    actionId: slug.slice(idx + sep.length) || 'thank-someone',
  };
}

// ─── Wordmark ──────────────────────────────────────────────────

function Wordmark() {
  const size = 18;
  const iconSize = size * 1.05;
  const outerD = iconSize * (20.4 / 24);
  const midD = iconSize * (12.8 / 24);
  const dotD = iconSize * (5.2 / 24);

  return (
    <View style={styles.wordmarkRow}>
      <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[styles.wordmarkCircle, { width: outerD, height: outerD, borderRadius: outerD / 2, opacity: 0.35 }]} />
        <View style={[styles.wordmarkCircle, { width: midD, height: midD, borderRadius: midD / 2, opacity: 0.65 }]} />
        <View style={{ width: dotD, height: dotD, borderRadius: dotD / 2, backgroundColor: Brand.ink }} />
      </View>
      <Text style={[styles.wordmarkText, { fontSize: size }]}>Ripple</Text>
    </View>
  );
}

// ─── Chain illustration ────────────────────────────────────────

function ChainIllustration() {
  const youScale = useSharedValue(0);
  const youOpacity = useSharedValue(0);
  const illustrationOpacity = useSharedValue(0);

  useEffect(() => {
    illustrationOpacity.value = withTiming(1, { duration: 400 });
    youScale.value = withDelay(600, withSpring(1, { damping: 13, stiffness: 130 }));
    youOpacity.value = withDelay(600, withTiming(1, { duration: 200 }));
  }, []);

  const illustrationStyle = useAnimatedStyle(() => ({ opacity: illustrationOpacity.value }));
  const youStyle = useAnimatedStyle(() => ({
    transform: [{ scale: youScale.value }],
    opacity: youOpacity.value,
  }));

  return (
    <Animated.View style={[styles.chainWrap, illustrationStyle]}>
      <Svg width={260} height={130} viewBox="0 0 260 130" style={StyleSheet.absoluteFill}>
        <Path d="M34 40 Q70 86 96 64" fill="none" stroke={Brand.blue} strokeWidth={2} strokeOpacity={0.4} strokeLinecap="round" />
        <Path d="M96 64 Q130 36 156 60" fill="none" stroke={Brand.blue} strokeWidth={2} strokeOpacity={0.4} strokeLinecap="round" />
        <Path d="M156 60 Q186 90 212 70" fill="none" stroke={Brand.teal} strokeWidth={2} strokeOpacity={0.45} strokeLinecap="round" />
      </Svg>
      <View style={{ position: 'absolute', left: 17, top: 23 }}>
        <Avatar index={0} size={34} />
      </View>
      <View style={{ position: 'absolute', left: 81, top: 49 }}>
        <Avatar index={3} size={30} />
      </View>
      <View style={{ position: 'absolute', left: 141, top: 45 }}>
        <Avatar index={5} size={30} />
      </View>
      <Animated.View style={[{ position: 'absolute', left: 193, top: 51 }, youStyle]}>
        <View style={styles.youCircle}>
          <Text style={styles.youLabel}>You?</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Screen ────────────────────────────────────────────────────

export default function DeepLinkScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const setPending = useDeepLinkStore((s) => s.setPending);

  const { inviterName, actionId } = parseSlug(slug ?? '');
  const action = getActionById(actionId) ?? getActionById('thank-someone')!;

  const handleJoin = () => {
    setPending(action.id, inviterName);
    router.replace('/sign-up' as never);
  };

  const handleSeeFirst = () => {
    router.push('/onboarding' as never);
  };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 36 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.wordmarkWrap}>
          <Wordmark />
        </View>

        <View style={styles.illustrationWrap}>
          <ChainIllustration />
        </View>

        <Text style={styles.headline}>{inviterName} started something.</Text>

        <Text style={styles.body}>
          {inviterName} completed{' '}
          <Text style={styles.bodyBold}>"{action.title}"</Text>
          {' '}and passed it to you. Will you keep the ripple going?
        </Text>

        {/* Action preview card */}
        <View style={styles.actionCard}>
          <View style={styles.actionCardTop}>
            <View style={[styles.levelBadge, { backgroundColor: action.color + '1A' }]}>
              <Text style={[styles.levelText, { color: action.color }]}>
                {LEVEL_LABEL[action.level]}
              </Text>
            </View>
            <Text style={styles.actionTime}>{action.time}</Text>
          </View>
          <Text style={styles.actionTitle}>{action.title}</Text>
        </View>

        <View style={{ flex: 1, minHeight: 32 }} />

        <View style={styles.ctas}>
          <Pressable style={styles.primaryBtn} onPress={handleJoin}>
            <Text style={styles.primaryBtnText}>I'll do this too</Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            You'll create a free account to track your impact.
          </Text>

          <Pressable onPress={handleSeeFirst} style={styles.secondaryLinkWrap}>
            <Text style={styles.secondaryLink}>See what Ripple is first →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.card },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  wordmarkWrap: { alignItems: 'center', paddingTop: 4 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmarkCircle: { position: 'absolute', borderWidth: 1.7, borderColor: Brand.ink },
  wordmarkText: { fontWeight: '800', color: Brand.ink, letterSpacing: -0.5 },
  illustrationWrap: { alignItems: 'center', marginTop: 30 },
  chainWrap: { width: 260, height: 130 },
  youCircle: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2.5, borderStyle: 'dashed', borderColor: Brand.blue,
    backgroundColor: Brand.blue + '0D', alignItems: 'center', justifyContent: 'center',
  },
  youLabel: { fontSize: 11, fontWeight: '800', color: Brand.blue },
  headline: {
    fontSize: 26, fontWeight: '800', color: Brand.ink,
    marginTop: 28, letterSpacing: -0.4, textAlign: 'center',
  },
  body: {
    fontSize: 15.5, color: Brand.sec, fontWeight: '600',
    lineHeight: 23, marginTop: 10, textAlign: 'center',
  },
  bodyBold: { color: Brand.ink, fontWeight: '700' },
  actionCard: {
    backgroundColor: Brand.softBg, borderWidth: 1,
    borderColor: Brand.border, borderRadius: 20, padding: 18, marginTop: 24,
  },
  actionCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  levelText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  actionTime: { fontSize: 12, color: Brand.muted, fontWeight: '700' },
  actionTitle: {
    fontSize: 19, fontWeight: '800', color: Brand.ink,
    lineHeight: 24, marginTop: 12, letterSpacing: -0.2,
  },
  ctas: { marginTop: 28 },
  primaryBtn: {
    height: 56, borderRadius: 28, backgroundColor: Brand.blue,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Brand.blue, shadowOpacity: 0.28, shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 }, elevation: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  disclaimer: {
    textAlign: 'center', marginTop: 12,
    fontSize: 12, color: Brand.muted, fontWeight: '600',
  },
  secondaryLinkWrap: { alignItems: 'center', marginTop: 14, paddingVertical: 4 },
  secondaryLink: { fontSize: 14, color: Brand.sec, fontWeight: '700' },
});
