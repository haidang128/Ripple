import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Text from '@/shared/ui/text';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Brand } from '@/constants/theme';
import { useAuthStore } from '@/shared/stores/auth-store';

// ─── Inline icons (only what this screen needs) ────────────────

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

function AppleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        fill={Brand.ink}
        d="M16.3 12.8c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6 1.7-1 2.4-2c.7-1.1 1-2.1 1-2.2 0 0-1.9-.7-2-2.8ZM14.4 6.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.3-.5.6-.9 1.5-.8 2.4.9.1 1.8-.4 2.4-1.1Z"
      />
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M21.6 12.2c0-.6-.1-1.2-.2-1.8H12v3.4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.1Z" />
      <Path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a6 6 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
      <Path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.8V7.6H3.1a10 10 0 0 0 0 8.9L6.4 14Z" />
      <Path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.6l3.3 2.6A6 6 0 0 1 12 6.1Z" />
    </Svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        fill="none"
        stroke={Brand.muted}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" fill="none" stroke={Brand.muted} strokeWidth={2} />
    </Svg>
  ) : (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M4 4l16 16" fill="none" stroke={Brand.muted} strokeWidth={2} strokeLinecap="round" />
      <Path
        d="M9.5 5.8A10 10 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.3M6.2 7.2A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9.7 9.7 0 0 0 2.7-.4"
        fill="none"
        stroke={Brand.muted}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M9.9 10a3 3 0 0 0 4.1 4.2"
        fill="none"
        stroke={Brand.muted}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Field ─────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  autoComplete?: 'email' | 'password' | 'off';
  secureTextEntry?: boolean;
  error?: string;
  trailing?: React.ReactNode;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  secureTextEntry = false,
  error,
  trailing,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text style={fieldStyles.label}>{label}</Text>
      <View
        style={[
          fieldStyles.box,
          focused && fieldStyles.boxFocused,
          !!error && fieldStyles.boxError,
        ]}
      >
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Brand.muted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {trailing}
      </View>
      {!!error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.ink,
    marginBottom: 7,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.card,
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  boxFocused: {
    borderColor: Brand.blue,
  },
  boxError: {
    borderColor: Brand.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Brand.ink,
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.danger,
    marginTop: 6,
  },
});

// ─── Screen ────────────────────────────────────────────────────

export default function SignUpScreen() {
  const { top } = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [pwError, setPwError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();

  const handleSubmit = async () => {
    let valid = true;
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }
    if (password.length < 8) {
      setPwError('Password must be at least 8 characters.');
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    const err = await signUp(email, password);
    setLoading(false);
    if (err) {
      if (err.toLowerCase().includes('already registered')) {
        setEmailError('An account with this email already exists.');
      } else {
        setEmailError(err);
      }
      return;
    }
    router.replace('/profile-setup');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: top }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <ChevLeft />
        </Pressable>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join the people already creating ripples.</Text>

        {/* Email + password */}
        <View style={styles.fields}>
          <Field
            label="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); setEmailError(''); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={emailError}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={(v) => { setPassword(v); setPwError(''); }}
            placeholder="8+ characters"
            autoComplete="password"
            secureTextEntry={!showPw}
            error={pwError}
            trailing={
              <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={8}>
                <EyeIcon visible={showPw} />
              </Pressable>
            }
          />
        </View>

        {/* CTA */}
        <Pressable style={[styles.primaryBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.primaryBtnText}>{loading ? 'Creating account…' : 'Create account'}</Text>
        </Pressable>

        {/* Legal */}
        <Text style={styles.legal}>
          By continuing you agree to our{' '}
          <Text style={styles.legalLink}>Terms</Text>
          {' '}and{' '}
          <Text style={styles.legalLink}>Privacy Policy.</Text>
        </Text>

        {/* Switch to sign in */}
        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Already have an account?{' '}</Text>
          <Pressable onPress={() => router.replace('/sign-in')} hitSlop={8}>
            <Text style={styles.signinLink}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Brand.softBg,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Brand.ink,
    marginTop: 24,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    color: Brand.sec,
    marginTop: 6,
    fontWeight: '600',
  },
  social: {
    gap: 12,
    marginTop: 26,
  },
  socialBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Brand.card,
    borderWidth: 1.5,
    borderColor: Brand.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Brand.ink,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Brand.border,
  },
  dividerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.muted,
  },
  fields: {
    gap: 16,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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
  legal: {
    fontSize: 12,
    color: Brand.muted,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
    fontWeight: '600',
  },
  legalLink: {
    color: Brand.sec,
    fontWeight: '700',
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
