import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '@/shared/ui/text';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Brand } from '@/constants/theme';
import { getActionById } from '@/shared/data/actions';
import { useCompletionStore } from '@/shared/stores/completion-store';
import { Avatar } from '@/shared/ui/avatar';
import { RippleRings } from '@/shared/ui/ripple-rings';
import NotificationPrompt, { NOTIF_PROMPT_KEY } from '@/features/notifications/notification-prompt';

const RIPPLE_NUMBER = 8247;
const COUNTER_FROM = 8200;

// ─── Radial glow background ────────────────────────────────────

function TealGlow() {
  return (
    <View style={styles.glowWrap} pointerEvents="none">
      <Svg width={460} height={460}>
        <Defs>
          <RadialGradient id="rg" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={Brand.teal} stopOpacity={0.14} />
            <Stop offset="65%" stopColor={Brand.teal} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={230} cy={230} r={230} fill="url(#rg)" />
      </Svg>
    </View>
  );
}

// ─── Particle ──────────────────────────────────────────────────

interface ParticleProps {
  dx: number;
  dy: number;
  color: string;
  size: number;
  delay: number;
}

function Particle({ dx, dy, color, size: s, delay }: ParticleProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) }),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      transform: [{ translateX: dx * p }, { translateY: dy * p }],
      opacity: p < 0.4 ? p / 0.4 : (1 - p) / 0.6,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 100 - s / 2,
          top: 100 - s / 2,
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

// ─── Halo pulse ────────────────────────────────────────────────

function HaloPulse() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1200, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.35 + (scale.value - 1) * 2,
  }));

  return <Animated.View style={[styles.halo, style]} />;
}

// ─── Phase 3 bottom card ───────────────────────────────────────

function ShareButton({
  label,
  bg,
  textColor = '#fff',
  onPress,
}: {
  label: string;
  bg: string;
  textColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.shareBtn, { backgroundColor: bg }]} onPress={onPress}>
      <Text style={[styles.shareBtnText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

function PlusIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" fill="none" stroke={Brand.muted} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

interface BottomCardProps {
  onShare: () => void;
  onSkip: () => void;
}

function BottomCard({ onShare, onSkip }: BottomCardProps) {
  const translateY = useSharedValue(280);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.bottomCard, cardStyle]}>
      <Text style={styles.cardHeader}>Pass it on</Text>
      <Text style={styles.cardSubtitle}>Challenge 3 friends to continue this ripple.</Text>

      <View style={styles.friendRow}>
        {[0, 1, 2].map(i => (
          <Pressable key={i} style={styles.friendSlot} onPress={onShare}>
            <PlusIcon />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.inviteBtn} onPress={onShare}>
        <Text style={styles.inviteBtnText}>Invite friends</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.cardHeader}>Share your ripple</Text>
      <Text style={styles.cardSubtitle}>Show your impact wherever you post.</Text>

      <View style={styles.shareRow}>
        <ShareButton label="WA" bg="#25D366" onPress={onShare} />
        <ShareButton label="IG" bg="#E1306C" onPress={onShare} />
        <ShareButton label="TT" bg={Brand.ink} onPress={onShare} />
        <ShareButton label="Copy" bg={Brand.blue} onPress={onShare} />
      </View>

      <Pressable onPress={onSkip} style={styles.laterWrap}>
        <Text style={styles.laterText}>Maybe later</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ────────────────────────────────────────────────────

export default function CelebrationScreen() {
  const { actionId } = useLocalSearchParams<{ actionId: string }>();
  const { top } = useSafeAreaInsets();

  const [phase, setPhase] = useState(1);
  const [count, setCount] = useState(COUNTER_FROM);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  // Phase timing — phase 3 gated behind notification prompt check
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 1500);
    const t2 = setTimeout(async () => {
      const seen = await SecureStore.getItemAsync(NOTIF_PROMPT_KEY);
      if (!seen) {
        setShowNotifPrompt(true);
      } else {
        setPhase(3);
      }
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Counter animation
  useEffect(() => {
    if (phase < 2) return;
    const start = performance.now();
    const duration = 1100;
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(COUNTER_FROM + (RIPPLE_NUMBER - COUNTER_FROM) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Particles
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }).map(() => {
        const ang = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 90;
        return {
          dx: Math.cos(ang) * d,
          dy: Math.sin(ang) * d,
          color: Math.random() > 0.5 ? Brand.teal : Brand.orange,
          size: 5 + Math.random() * 5,
          delay: Math.floor(Math.random() * 300),
        };
      }),
    [],
  );

  // Text fade/slide
  const textOpacity = useSharedValue(0);
  const textSlide = useSharedValue(14);

  useEffect(() => {
    if (phase >= 2) {
      textOpacity.value = withTiming(1, { duration: 600 });
      textSlide.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
    }
  }, [phase]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textSlide.value }],
  }));

  const setCompleted = useCompletionStore((s) => s.setCompleted);
  const [newLevel, setNewLevel] = useState<string | null>(null);
  const [marked, setMarked] = useState(false);

  // Mark completion exactly once when the screen mounts
  useEffect(() => {
    if (marked) return;
    const action = getActionById(actionId ?? '');
    const lvl = setCompleted(action?.title ?? '', actionId ?? '', action?.color ?? '', action?.level ?? 'SEED');
    setNewLevel(lvl);
    setMarked(true);
  }, []);

  const handleShare = () => {
    router.push({ pathname: '/share-card', params: { actionId } } as never);
  };

  const handleSkip = () => {
    if (newLevel) {
      router.replace({ pathname: '/level-up', params: { toLevel: newLevel } } as never);
    } else {
      router.dismissAll();
    }
  };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <TealGlow />

      {/* Notification opt-in prompt (first celebration only) */}
      {showNotifPrompt && (
        <NotificationPrompt onDone={() => { setShowNotifPrompt(false); setPhase(3); }} />
      )}

      {/* Center: rings + avatar + particles */}
      <View style={styles.center}>
        <View style={styles.ringContainer}>
          <RippleRings
            size={200}
            count={5}
            duration={2600}
            color="rgba(0,201,167,0.4)"
            thickness={1.6}
          />
          <HaloPulse />
          <View style={styles.avatarWrap}>
            <Avatar index={0} size={72} />
          </View>
          {particles.map((p, i) => (
            <Particle key={i} {...p} />
          ))}
        </View>

        {/* Text */}
        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.createdLabel}>You created</Text>
          <Text style={styles.rippleNumber}>Ripple #{count.toLocaleString()}</Text>
          <Text style={styles.subtitle}>
            Every ripple that came before yours made this possible.
          </Text>
        </Animated.View>
      </View>

      {/* Phase 3 card */}
      {phase >= 3 && (
        <BottomCard onShare={handleShare} onSkip={handleSkip} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.darkBg,
    overflow: 'hidden',
  },
  glowWrap: {
    position: 'absolute',
    top: '24%',
    left: '50%',
    transform: [{ translateX: -230 }, { translateY: -230 }],
    zIndex: 0,
  },
  center: {
    alignItems: 'center',
    paddingTop: 50,
    zIndex: 2,
    position: 'relative',
  },
  ringContainer: {
    width: 200,
    height: 200,
  },
  halo: {
    position: 'absolute',
    left: (200 - 96) / 2,
    top: (200 - 96) / 2,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Brand.teal,
  },
  avatarWrap: {
    position: 'absolute',
    left: (200 - 72) / 2,
    top: (200 - 72) / 2,
    zIndex: 3,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  createdLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },
  rippleNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginTop: 12,
    maxWidth: 280,
    lineHeight: 22,
    textAlign: 'center',
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    backgroundColor: Brand.card,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 30,
  },
  cardHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: Brand.ink,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Brand.sec,
    fontWeight: '600',
    marginTop: 3,
  },
  friendRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    marginBottom: 16,
  },
  friendSlot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.blue,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  inviteBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: Brand.border,
    marginVertical: 20,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    justifyContent: 'space-between',
  },
  shareBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  laterWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  laterText: {
    fontSize: 13,
    color: Brand.muted,
    fontWeight: '700',
  },
});
