import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '@/shared/ui/text';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Brand } from '@/constants/theme';

export const NOTIF_PROMPT_KEY = 'hasSeenNotifPrompt';

function BellIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        stroke={Brand.teal}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TealGlow() {
  return (
    <View style={styles.glowWrap} pointerEvents="none">
      <Svg width={320} height={320}>
        <Defs>
          <RadialGradient id="ng" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={Brand.teal} stopOpacity={0.18} />
            <Stop offset="100%" stopColor={Brand.teal} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={160} cy={160} r={160} fill="url(#ng)" />
      </Svg>
    </View>
  );
}

interface NotificationPromptProps {
  onDone: () => void;
}

export default function NotificationPrompt({ onDone }: NotificationPromptProps) {
  const opacity = useSharedValue(0);
  const slideY = useSharedValue(40);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    slideY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: slideY.value }],
  }));

  const dismiss = async (requestPermission: boolean) => {
    await SecureStore.setItemAsync(NOTIF_PROMPT_KEY, '1');
    if (requestPermission) {
      await Notifications.requestPermissionsAsync();
    }
    onDone();
  };

  return (
    <Animated.View style={[styles.root, containerStyle]}>
      <TealGlow />

      <View style={styles.iconWrap}>
        <BellIcon />
      </View>

      <Text style={styles.headline}>Never miss a ripple.</Text>
      <Text style={styles.body}>
        Get a daily nudge at your perfect time to keep your streak alive and see who you've inspired.
      </Text>

      <Pressable style={styles.primaryBtn} onPress={() => dismiss(true)}>
        <Text style={styles.primaryBtnText}>Turn on notifications</Text>
      </Pressable>

      <Pressable onPress={() => dismiss(false)} style={styles.laterWrap} hitSlop={12}>
        <Text style={styles.laterText}>Not now</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    inset: 0,
    backgroundColor: Brand.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  glowWrap: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -160 }, { translateY: -160 }],
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Brand.teal}20`,
    borderWidth: 1.5,
    borderColor: `${Brand.teal}40`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  headline: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    shadowColor: Brand.blue,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  laterWrap: {
    marginTop: 18,
  },
  laterText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '700',
  },
});
