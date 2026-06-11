import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '@/shared/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Brand } from '@/constants/theme';
import { RippleRings } from '@/shared/ui/ripple-rings';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '@/shared/stores/auth-store';

const RING_SIZE = 340;

function Wordmark() {
  const size = 40;
  const iconSize = size * 1.05;
  const outerD = iconSize * (20.4 / 24);
  const midD = iconSize * (12.8 / 24);
  const dotD = iconSize * (5.2 / 24);

  return (
    <View style={styles.wordmark}>
      <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[styles.circle, { width: outerD, height: outerD, borderRadius: outerD / 2, opacity: 0.4 }]} />
        <View style={[styles.circle, { width: midD, height: midD, borderRadius: midD / 2, opacity: 0.7 }]} />
        <View style={{ width: dotD, height: dotD, borderRadius: dotD / 2, backgroundColor: '#fff' }} />
      </View>
      <Text style={[styles.wordmarkText, { fontSize: size }]}>Ripple</Text>
    </View>
  );
}

export default function SplashScreen() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: { session } }, seen] = await Promise.all([
        supabase.auth.getSession(),
        SecureStore.getItemAsync('hasSeenOnboarding'),
      ]);
      await new Promise((r) => setTimeout(r, 2600));
      if (cancelled) return;

      if (session) {
        useAuthStore.getState().setSession(session);
        await useAuthStore.getState().loadProfile();
        const { profile } = useAuthStore.getState();
        router.replace((profile ? '/(tabs)/home' : '/profile-setup') as never);
        return;
      }
      router.replace((seen ? '/sign-in' : '/onboarding') as never);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <LinearGradient
      colors={[Brand.blue, Brand.blueDeep, Brand.ink]}
      locations={[0, 0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Rings centered at 42% from top — same as prototype */}
      <View style={styles.ringsAnchor}>
        <View style={styles.ringsFrame}>
          <RippleRings size={RING_SIZE} count={4} duration={3400} color="rgba(255,255,255,0.16)" thickness={1.6} />
        </View>
      </View>

      <View style={styles.content}>
        <Wordmark />
        <Text style={styles.tagline}>One good action. Infinite impact.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ringsAnchor: {
    position: 'absolute',
    top: '42%',
    left: '50%',
    transform: [{ translateX: -(RING_SIZE / 2) }, { translateY: -(RING_SIZE / 2) }],
  },
  ringsFrame: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    position: 'absolute',
    borderWidth: 1.7,
    borderColor: '#fff',
  },
  wordmarkText: {
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  content: {
    alignItems: 'center',
  },
  tagline: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
    letterSpacing: 0.2,
  },
});
