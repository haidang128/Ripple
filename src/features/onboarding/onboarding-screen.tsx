import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Text from '@/shared/ui/text';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Brand } from '@/constants/theme';
import { Avatar } from '@/shared/ui/avatar';
import { RippleRings } from '@/shared/ui/ripple-rings';

// ─── Shared shell (matches OnboShell in prototype) ─────────────

function SlideShell({
  topInset,
  visual,
  text,
}: {
  topInset: number;
  visual: React.ReactNode;
  text: React.ReactNode;
}) {
  return (
    <View style={[styles.shell, { paddingTop: topInset + 16 }]}>
      <View style={styles.visualArea}>{visual}</View>
      <View style={styles.textArea}>{text}</View>
    </View>
  );
}

// ─── Slide A: chain reaction 1→3→9 ────────────────────────────

function SlideA({ active, topInset }: { active: boolean; topInset: number }) {
  const SIZE = 240;
  const MID_R = 44;
  const OUT_R = 80;
  const cx = SIZE / 2;

  return (
    <SlideShell
      topInset={topInset}
      visual={
        <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
          {active && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <RippleRings size={SIZE} count={3} duration={3000} color={`${Brand.blue}22`} thickness={1.4} />
            </View>
          )}

          {/* Outer 9 teal dots */}
          {Array.from({ length: 9 }).map((_, k) => {
            const ang = (k / 9) * Math.PI * 2;
            return (
              <View
                key={`o${k}`}
                style={{
                  position: 'absolute',
                  width: 13,
                  height: 13,
                  borderRadius: 6.5,
                  backgroundColor: Brand.teal,
                  opacity: 0.55,
                  left: cx + Math.cos(ang) * OUT_R - 6.5,
                  top: cx + Math.sin(ang) * OUT_R - 6.5,
                }}
              />
            );
          })}

          {/* Mid 3 avatars */}
          {[2, 3, 4].map((avIdx, k) => {
            const ang = (k / 3) * Math.PI * 2 - Math.PI / 2;
            return (
              <View
                key={`m${k}`}
                style={{
                  position: 'absolute',
                  left: cx + Math.cos(ang) * MID_R - 13,
                  top: cx + Math.sin(ang) * MID_R - 13,
                }}
              >
                <Avatar index={avIdx} size={26} />
              </View>
            );
          })}

          {/* Center avatar */}
          <View style={{ zIndex: 3 }}>
            <Avatar index={0} size={52} ring />
          </View>
        </View>
      }
      text={
        <View>
          <Text style={styles.heading}>
            {'Social apps spread content.\n'}
            <Text style={{ color: Brand.blue }}>Ripple spreads actions.</Text>
          </Text>
          <Text style={styles.body}>
            Every good thing you do can inspire someone else to do the same.
          </Text>
        </View>
      }
    />
  );
}

// ─── Slide B: action tree with SVG connections ─────────────────

const ICON_PATHS = {
  heart:
    'M12 20s-7-4.5-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.5 12 20 12 20Z',
  leaf: 'M5 19c0-7 5-12 14-12 0 9-5 14-12 14-1.5 0-2-1-2-2ZM8 16c3-3 6-5 9-6',
  hand: 'M8 11V5.5a1.5 1.5 0 0 1 3 0V11m0 0V4.5a1.5 1.5 0 0 1 3 0V11m0 0V6a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6h-1c-2 0-3-1-4-2.5L4 13c-.7-1 .7-2.5 1.7-1.6L8 13',
};

type IconName = keyof typeof ICON_PATHS;

function ActionBadge({ size, icon }: { size: number; icon: IconName }) {
  const d = size * 0.5;
  const iconSize = size * 0.32;
  return (
    <View
      style={{
        position: 'absolute',
        bottom: -3,
        right: -3,
        width: d,
        height: d,
        borderRadius: d / 2,
        backgroundColor: Brand.card,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
      }}
    >
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
        <Path
          d={ICON_PATHS[icon]}
          fill="none"
          stroke={Brand.orange}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function SlideB({ topInset }: { topInset: number }) {
  const W = 240;
  const H = 210;
  const nodes: { x: number; y: number; idx: number; s: number; ic: IconName }[] = [
    { x: 120, y: 26,  idx: 0, s: 40, ic: 'heart' },
    { x: 64,  y: 96,  idx: 2, s: 30, ic: 'leaf'  },
    { x: 176, y: 96,  idx: 4, s: 30, ic: 'hand'  },
    { x: 96,  y: 168, idx: 6, s: 26, ic: 'leaf'  },
    { x: 196, y: 168, idx: 1, s: 26, ic: 'heart' },
  ];

  return (
    <SlideShell
      topInset={topInset}
      visual={
        <View style={{ width: W, height: H }}>
          {/* SVG connection paths */}
          <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
            <Path d="M120 40 Q70 60 70 92"    fill="none" stroke={Brand.blue} strokeWidth={2} strokeOpacity={0.35} strokeLinecap="round" />
            <Path d="M120 40 Q176 60 176 88"  fill="none" stroke={Brand.blue} strokeWidth={2} strokeOpacity={0.35} strokeLinecap="round" />
            <Path d="M64 108 Q80 150 96 158"  fill="none" stroke={Brand.teal} strokeWidth={2} strokeOpacity={0.4}  strokeLinecap="round" />
            <Path d="M176 108 Q186 150 196 158" fill="none" stroke={Brand.teal} strokeWidth={2} strokeOpacity={0.4}  strokeLinecap="round" />
          </Svg>

          {/* Avatar nodes */}
          {nodes.map((n, k) => (
            <View
              key={k}
              style={{
                position: 'absolute',
                left: n.x - n.s / 2,
                top: n.y - n.s / 2,
              }}
            >
              <View style={{ position: 'relative' }}>
                <Avatar index={n.idx} size={n.s} />
                <ActionBadge size={n.s} icon={n.ic} />
              </View>
            </View>
          ))}
        </View>
      }
      text={
        <View>
          <Text style={styles.heading}>Your action doesn't stop with you.</Text>
          <Text style={styles.body}>
            When you complete something good and share it, others can join the same ripple — and grow it further.
          </Text>
          {/* Stat chip */}
          <View style={styles.statChip}>
            <Text style={styles.statItem}>1 action</Text>
            <Svg width={15} height={15} viewBox="0 0 24 24">
              <Path d="M5 12h14M13 6l6 6-6 6" stroke={Brand.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.statItem}>3 friends</Text>
            <Svg width={15} height={15} viewBox="0 0 24 24">
              <Path d="M5 12h14M13 6l6 6-6 6" stroke={Brand.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={[styles.statItem, { color: Brand.blue }]}>12 inspired</Text>
          </View>
        </View>
      }
    />
  );
}

// ─── Slide C: one action a day ─────────────────────────────────

function SlideC({ active, topInset }: { active: boolean; topInset: number }) {
  const SIZE = 220;
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (active) {
      floatY.value = withRepeat(
        withTiming(-7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      floatY.value = 0;
    }
  }, [active]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <SlideShell
      topInset={topInset}
      visual={
        <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
          {active && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <RippleRings size={SIZE} count={3} duration={3200} color={`${Brand.teal}2E`} thickness={1.5} />
            </View>
          )}

          {/* Glow halo */}
          <View
            style={{
              position: 'absolute',
              width: 132,
              height: 132,
              borderRadius: 66,
              backgroundColor: `${Brand.teal}22`,
            }}
          />

          {/* Floating avatar */}
          <Animated.View style={floatStyle}>
            <Avatar index={0} size={76} ring />
          </Animated.View>
        </View>
      }
      text={
        <View>
          <Text style={styles.heading}>One action a day.</Text>
          <Text style={styles.body}>
            That's it. We'll suggest something that fits your life. Complete it. Pass it on. See your impact grow.
          </Text>
        </View>
      }
    />
  );
}

// ─── Main screen ───────────────────────────────────────────────

export default function OnboardingScreen() {
  const [slide, setSlide] = useState(0);
  const { width: W } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const offset = useSharedValue(0);

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const markSeen = () => SecureStore.setItemAsync('hasSeenOnboarding', '1');

  const advance = () => {
    if (slide < 2) {
      const next = slide + 1;
      setSlide(next);
      offset.value = withTiming(-next * W, {
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    } else {
      markSeen();
      router.replace('/sign-up' as never);
    }
  };

  const skip = () => { markSeen(); router.replace('/sign-up' as never); };

  return (
    <View style={styles.root}>
      {/* Skip button — visible on slides 0 and 1 */}
      {slide < 2 && (
        <Pressable
          onPress={skip}
          style={[styles.skipBtn, { top: top + 14 }]}
          hitSlop={12}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Slide track */}
      <View style={styles.trackClip}>
        <Animated.View style={[{ flexDirection: 'row', width: W * 3, flex: 1 }, trackStyle]}>
          <View style={{ width: W }}>
            <SlideA active={slide === 0} topInset={top} />
          </View>
          <View style={{ width: W }}>
            <SlideB topInset={top} />
          </View>
          <View style={{ width: W }}>
            <SlideC active={slide === 2} topInset={top} />
          </View>
        </Animated.View>
      </View>

      {/* Footer: dots + arrow (slides 0-1) or empty on slide 2 */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {[0, 1, 2].map((d) => (
            <Animated.View
              key={d}
              style={[
                styles.dot,
                {
                  width: d === slide ? 22 : 8,
                  backgroundColor: d === slide ? Brand.blue : Brand.border,
                },
              ]}
            />
          ))}
        </View>

        {slide < 2 ? (
          <Pressable onPress={advance} style={styles.arrowBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>

      {/* Slide 3 CTA — absolutely overlays the footer area */}
      {slide === 2 && (
        <View style={styles.cta}>
          <Pressable onPress={() => { markSeen(); router.replace('/sign-up' as never); }} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Start my first ripple</Text>
          </Pressable>
          <View style={styles.signinRow}>
            <Text style={styles.signinText}>Already have an account?{' '}</Text>
            <Pressable onPress={() => { markSeen(); router.replace('/sign-in' as never); }} hitSlop={8}>
              <Text style={styles.signinLink}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.card,
    position: 'relative',
    overflow: 'hidden',
  },
  skipBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Brand.muted,
  },
  trackClip: {
    flex: 1,
    overflow: 'hidden',
  },
  // Shell layout
  shell: {
    flex: 1,
    paddingHorizontal: 28,
    alignSelf: 'stretch',
  },
  visualArea: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textArea: {
    flex: 5,
    paddingTop: 4,
  },
  // Typography
  heading: {
    fontSize: 27,
    fontWeight: '800',
    color: Brand.ink,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  body: {
    fontSize: 16,
    color: Brand.sec,
    lineHeight: 24,
    marginTop: 14,
    fontWeight: '600',
  },
  // Stat chip (Slide B)
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 18,
    backgroundColor: Brand.softBg,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statItem: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Brand.ink,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 8,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  arrowBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.blue,
    shadowOpacity: 0.34,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  // Slide 3 CTA overlay
  cta: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 36,
    zIndex: 12,
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
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  signinText: {
    fontSize: 14,
    color: Brand.sec,
    fontWeight: '600',
  },
  signinLink: {
    fontSize: 14,
    color: Brand.blue,
    fontWeight: '700',
  },
});
