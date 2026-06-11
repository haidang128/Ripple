import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Brand } from '@/constants/theme';

function WifiOffIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
      <Path d="M1 1l22 22" stroke={Brand.muted} strokeWidth={2} strokeLinecap="round" />
      <Path d="M16.7 16.7A8 8 0 0 0 8.1 8.1M5 12.5A10.5 10.5 0 0 1 12 10c1 0 2 .15 2.9.4" stroke={Brand.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.7 16.8A3 3 0 0 1 15 20" stroke={Brand.muted} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 20h.01" stroke={Brand.muted} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function AlertIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
      <Path d="M10.3 3.8L2 19a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 19L13.7 3.8a2 2 0 0 0-3.4 0Z" stroke={Brand.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 9v4M12 17h.01" stroke={Brand.muted} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

interface ErrorStateProps {
  type?: 'offline' | 'error';
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  type = 'error',
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  const defaultTitle = type === 'offline' ? "You're offline" : 'Something went wrong';
  const defaultMessage =
    type === 'offline'
      ? "Check your connection and try again."
      : "We couldn't load this right now.";

  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        {type === 'offline' ? <WifiOffIcon /> : <AlertIcon />}
      </View>
      <Text style={styles.title}>{title ?? defaultTitle}</Text>
      <Text style={styles.message}>{message ?? defaultMessage}</Text>
      {onRetry && (
        <Pressable style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryBtnText}>{retryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Brand.softBg,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: Brand.ink,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Brand.sec,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 260,
  },
  retryBtn: {
    marginTop: 24,
    height: 46,
    borderRadius: 23,
    backgroundColor: Brand.blue,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
