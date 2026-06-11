import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '@/shared/ui/text';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '@/constants/theme';

type Level = 'SPARK' | 'WAVE';

const LEVEL_META: Record<Level, { label: string; color: string; number: string; desc: string }> = {
  SPARK: {
    label: 'Spark',
    color: Brand.orange,
    number: 'Level 2',
    desc: "Your actions are catching fire.\nKeep going — others are watching.",
  },
  WAVE: {
    label: 'Wave',
    color: Brand.blue,
    number: 'Level 3',
    desc: "You're creating a wave that reaches\nfurther than you know.",
  },
};

// ─── Particle ──────────────────────────────────────────────────

function Particle({ dx, dy, color, size: s, delay }: { dx: number; dy: number; color: string; size: number; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 900, easing: Easing.out(Easing.ease) }));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: dx * p.value }, { translateY: dy * p.value }],
    opacity: p.value < 0.3 ? p.value / 0.3 : 1 - (p.value - 0.3) / 0.7,
  }));
  return (
    <Animated.View style={[{ position: 'absolute', width: s, height: s, borderRadius: s / 2, backgroundColor: color }, style]} />
  );
}

// ─── Badge ─────────────────────────────────────────────────────

function LevelBadge({ color, label, number }: { color: string; label: string; number: string }) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-15);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 180 }));
    rotate.value = withDelay(200, withSpring(0, { damping: 14, stiffness: 160 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.badgeWrap, style]}>
      <View style={[styles.badgeOuter, { borderColor: `${color}40` }]}>
        <View style={[styles.badgeInner, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.badgeNumber, { color }]}>{number}</Text>
          <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Screen ────────────────────────────────────────────────────

export default function LevelUpScreen() {
  const { toLevel } = useLocalSearchParams<{ toLevel: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const meta = LEVEL_META[(toLevel as Level) ?? 'SPARK'];

  const textOpacity = useSharedValue(0);
  const textSlide = useSharedValue(16);

  useEffect(() => {
    textOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    textSlide.value = withDelay(500, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
  }, []);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textSlide.value }],
  }));

  const particles = useMemo(() =>
    Array.from({ length: 28 }).map(() => {
      const ang = Math.random() * Math.PI * 2;
      const d = 70 + Math.random() * 110;
      return {
        dx: Math.cos(ang) * d,
        dy: Math.sin(ang) * d,
        color: Math.random() > 0.5 ? meta.color : Brand.teal,
        size: 5 + Math.random() * 6,
        delay: Math.floor(Math.random() * 400),
      };
    }), []);

  return (
    <View style={[styles.root, { paddingTop: top, paddingBottom: bottom + 24 }]}>
      {/* Radial glow */}
      <View style={styles.glow} pointerEvents="none">
        <Svg width={400} height={400}>
          <Defs>
            <RadialGradient id="lg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={meta.color} stopOpacity={0.2} />
              <Stop offset="100%" stopColor={meta.color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={200} cy={200} r={200} fill="url(#lg)" />
        </Svg>
      </View>

      <View style={styles.center}>
        {/* Particle burst container */}
        <View style={styles.particleContainer}>
          {particles.map((p, i) => <Particle key={i} {...p} />)}
          <LevelBadge color={meta.color} label={meta.label} number={meta.number} />
        </View>

        {/* Text */}
        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.levelUpLabel}>Level up!</Text>
          <Text style={[styles.headline, { color: meta.color }]}>You're a {meta.label} now.</Text>
          <Text style={styles.desc}>{meta.desc}</Text>
        </Animated.View>
      </View>

      <Pressable style={[styles.ctaBtn, { backgroundColor: meta.color }]} onPress={() => router.dismissAll()}>
        <Text style={styles.ctaBtnText}>Keep going</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.darkBg,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -200 }],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  particleContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    position: 'absolute',
  },
  badgeOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  badgeNumber: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  badgeLabel: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  levelUpLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
  },
  ctaBtn: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    alignSelf: 'stretch',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
