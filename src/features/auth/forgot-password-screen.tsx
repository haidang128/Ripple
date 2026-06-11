import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Text from '@/shared/ui/text';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Brand } from '@/constants/theme';
import { useAuthStore } from '@/shared/stores/auth-store';

function ChevLeft() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" fill="none" stroke={Brand.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MailIcon() {
  return (
    <Svg width={38} height={38} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={4} width={20} height={16} rx={3} stroke={Brand.blue} strokeWidth={2} />
      <Path d="M2 8l10 6 10-6" stroke={Brand.blue} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ForgotPasswordScreen() {
  const { top } = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();

  const handleSend = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    const err = await resetPassword(email);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.root, { paddingTop: top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <ChevLeft />
        </Pressable>

        {!sent ? (
          <View style={styles.content}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to get back in.
            </Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View
                style={[
                  styles.fieldBox,
                  focused && styles.fieldBoxFocused,
                  !!error && styles.fieldBoxError,
                ]}
              >
                <TextInput
                  style={styles.fieldInput}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  placeholder="you@example.com"
                  placeholderTextColor={Brand.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </View>
              {!!error && <Text style={styles.fieldError}>{error}</Text>}
            </View>

            <Pressable style={[styles.primaryBtn, loading && { opacity: 0.6 }]} onPress={handleSend} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Sending…' : 'Send reset link'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.successContent}>
            <View style={styles.mailIconWrap}>
              <MailIcon />
            </View>
            <Text style={styles.successTitle}>Check your inbox</Text>
            <Text style={styles.successBody}>
              We sent a reset link to{'\n'}
              <Text style={{ fontWeight: '800', color: Brand.ink }}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              It may take a minute to arrive. Check your spam folder if you don't see it.
            </Text>

            <Pressable onPress={() => setSent(false)} style={styles.resendWrap} hitSlop={8}>
              <Text style={styles.resendText}>Didn't get it? </Text>
              <Text style={styles.resendLink}>Resend</Text>
            </Pressable>

            <Pressable style={[styles.primaryBtn, { marginTop: 32 }]} onPress={() => router.replace('/sign-in' as never)}>
              <Text style={styles.primaryBtnText}>Back to sign in</Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.softBg,
    paddingHorizontal: 20,
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
    marginTop: 8,
  },
  content: {
    marginTop: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Brand.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    color: Brand.sec,
    marginTop: 8,
    fontWeight: '600',
    lineHeight: 23,
  },
  fieldWrap: {
    marginTop: 28,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.ink,
    marginBottom: 7,
  },
  fieldBox: {
    backgroundColor: Brand.card,
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
  },
  fieldBoxFocused: {
    borderColor: Brand.blue,
  },
  fieldBoxError: {
    borderColor: Brand.danger,
  },
  fieldInput: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.ink,
  },
  fieldError: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.danger,
    marginTop: 6,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
  },
  // Success state
  successContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 48,
  },
  mailIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Brand.blue}14`,
    borderWidth: 1.5,
    borderColor: `${Brand.blue}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Brand.ink,
    letterSpacing: -0.4,
  },
  successBody: {
    fontSize: 16,
    color: Brand.sec,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
  },
  successHint: {
    fontSize: 13.5,
    color: Brand.muted,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
    maxWidth: 280,
  },
  resendWrap: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: Brand.muted,
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 14,
    color: Brand.blue,
    fontWeight: '700',
  },
});
