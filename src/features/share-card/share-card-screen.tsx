import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import Text from '@/shared/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { Brand } from '@/constants/theme';
import { getActionById } from '@/shared/data/actions';
import { useAuthStore } from '@/shared/stores/auth-store';

// ─── Themes ────────────────────────────────────────────────────

const THEMES: { id: string; colors: [string, string]; fg: string }[] = [
  { id: 'blue',  colors: [Brand.blue, Brand.teal],        fg: '#fff' },
  { id: 'dark',  colors: [Brand.darkCard, Brand.darkBg],  fg: '#fff' },
  { id: 'warm',  colors: [Brand.orange, '#FFB266'],       fg: '#fff' },
];

// ─── Card decoration ───────────────────────────────────────────

function CardRippleRings() {
  return (
    <Svg width={160} height={160} style={{ position: 'absolute', top: -30, right: -30, opacity: 0.2 }}>
      {[30, 52, 74].map((r, i) => (
        <Circle key={i} cx={80} cy={80} r={r} fill="none" stroke="#fff" strokeWidth={2} />
      ))}
    </Svg>
  );
}

// ─── Icons ─────────────────────────────────────────────────────

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M15 18l-6-6 6-6" fill="none" stroke={Brand.ink} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24">
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" fill="none" stroke={Brand.blue} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M20 6 9 17l-5-5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Share platform button ─────────────────────────────────────

function PlatformBtn({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.platformBtn, { borderColor: Brand.border }]} onPress={onPress}>
      <View style={[styles.platformDot, { backgroundColor: color }]} />
      <Text style={styles.platformLabel}>{label}</Text>
    </Pressable>
  );
}

// ─── Screen ────────────────────────────────────────────────────

export default function ShareCardScreen() {
  const { actionId } = useLocalSearchParams<{ actionId: string }>();
  const { top, bottom } = useSafeAreaInsets();

  const [format, setFormat] = useState<'feed' | 'story'>('feed');
  const [theme, setTheme] = useState(0);
  const [toast, setToast] = useState('');

  const profile = useAuthStore((s) => s.profile);
  const name = profile?.name ?? 'Someone';

  const action = getActionById(actionId ?? '') ?? getActionById('thank-someone')!;
  const currentTheme = THEMES[theme];

  const cardW = format === 'feed' ? 272 : 218;
  const cardH = format === 'feed' ? 340 : 388;

  // Build the invite deep link: ripple://deep-link/{encodedName}__{actionId}
  const inviteSlug = `${encodeURIComponent(name)}__${action.id}`;
  const inviteUrl = Linking.createURL(`deep-link/${inviteSlug}`);
  const inviteMessage = `${name} just completed "${action.title}" on Ripple — a daily kindness app. Will you do it too?\n\n${inviteUrl}`;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: inviteMessage, url: inviteUrl });
    } catch {
      showToast('Could not open share sheet.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await Share.share({ message: inviteUrl });
    } catch {
      showToast('Could not open share sheet.');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Your share card</Text>
            <Text style={styles.headerSub}>Ready to post.</Text>
          </View>
        </View>

        {/* Card preview */}
        <View style={styles.previewWrap}>
          <LinearGradient
            colors={currentTheme.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { width: cardW, height: cardH }]}
          >
            <CardRippleRings />
            <Text style={styles.wordmark}>ripple</Text>
            <View style={styles.cardCenter}>
              <Text style={[styles.cardQuote, { fontSize: format === 'feed' ? 20 : 18 }]}>
                "{action.title}"
              </Text>
              <Text style={styles.cardAuthor}>— {name}</Text>
              <View style={styles.rippleBadge}>
                <Text style={styles.rippleBadgeText}>{action.level} action</Text>
              </View>
            </View>
            <Text style={styles.cardLink}>ripple.app</Text>
          </LinearGradient>
        </View>

        {/* Format toggle */}
        <View style={styles.formatToggle}>
          {(['feed', 'story'] as const).map(f => (
            <Pressable
              key={f}
              style={[styles.formatBtn, format === f && styles.formatBtnActive]}
              onPress={() => setFormat(f)}
            >
              <Text style={[styles.formatBtnText, format === f && styles.formatBtnTextActive]}>
                {f === 'feed' ? 'Feed post' : 'Story'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Theme dots */}
        <View style={styles.themeDots}>
          {THEMES.map((t, i) => (
            <Pressable key={t.id} onPress={() => setTheme(i)} style={styles.themeBtn}>
              <LinearGradient
                colors={t.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.themeDot, i === theme && styles.themeDotSelected]}
              >
                {i === theme && <CheckIcon />}
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        {/* Main share button */}
        <Pressable style={styles.primaryShareBtn} onPress={handleShare}>
          <ShareIcon />
          <Text style={styles.primaryShareText}>Invite a friend</Text>
        </Pressable>

        {/* Share to */}
        <Text style={styles.sectionLabel}>SHARE TO APP</Text>
        <View style={styles.platformRow}>
          <PlatformBtn label="WhatsApp"  color="#25D366" onPress={handleShare} />
          <PlatformBtn label="Instagram" color="#E1306C" onPress={handleShare} />
          <PlatformBtn label="TikTok"    color={Brand.ink} onPress={handleShare} />
          <PlatformBtn label="Twitter"   color="#1DA1F2" onPress={handleShare} />
          <PlatformBtn label="Copy link" color={Brand.blue} onPress={handleCopyLink} />
        </View>

        {/* Invite link preview */}
        <View style={styles.linkBox}>
          <Text style={styles.linkBoxLabel}>INVITE LINK</Text>
          <Text style={styles.linkBoxUrl} numberOfLines={2}>{inviteUrl}</Text>
        </View>
      </ScrollView>

      {/* Toast */}
      {!!toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.softBg },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: Brand.border, backgroundColor: Brand.card,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  headerText: { minWidth: 0 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  headerSub: { fontSize: 13, color: Brand.sec, fontWeight: '600' },
  previewWrap: { alignItems: 'center', marginTop: 20 },
  card: {
    borderRadius: 24, padding: 24, overflow: 'hidden',
    shadowColor: '#1A1A2E', shadowOpacity: 0.22, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }, elevation: 12,
    justifyContent: 'space-between',
  },
  wordmark: { fontSize: 20, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: -0.3, zIndex: 1 },
  cardCenter: { flex: 1, justifyContent: 'center' },
  cardQuote: { fontWeight: '800', color: '#fff', lineHeight: 26, letterSpacing: -0.3 },
  cardAuthor: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: 12 },
  rippleBadge: {
    alignSelf: 'flex-start', marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999,
    paddingHorizontal: 13, paddingVertical: 6,
  },
  rippleBadgeText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  cardLink: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  formatToggle: {
    flexDirection: 'row', backgroundColor: Brand.card, borderWidth: 1,
    borderColor: Brand.border, borderRadius: 12, padding: 4, marginTop: 20, gap: 4,
  },
  formatBtn: { flex: 1, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  formatBtnActive: { backgroundColor: Brand.blue },
  formatBtnText: { fontSize: 14, fontWeight: '800', color: Brand.sec },
  formatBtnTextActive: { color: '#fff' },
  themeDots: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 18 },
  themeBtn: { padding: 2 },
  themeDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  themeDotSelected: { borderWidth: 2.5, borderColor: Brand.ink },
  primaryShareBtn: {
    height: 52, borderRadius: 26, backgroundColor: Brand.blue,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 22,
    shadowColor: Brand.blue, shadowOpacity: 0.28, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  primaryShareText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', letterSpacing: 1.5,
    color: Brand.muted, marginTop: 24, marginBottom: 12,
  },
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platformBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1, backgroundColor: Brand.card,
  },
  platformDot: { width: 10, height: 10, borderRadius: 5 },
  platformLabel: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  linkBox: {
    marginTop: 22, backgroundColor: Brand.card, borderWidth: 1,
    borderColor: Brand.border, borderRadius: 14, padding: 14,
  },
  linkBoxLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: Brand.muted, marginBottom: 6 },
  linkBoxUrl: { fontSize: 13, fontWeight: '600', color: Brand.sec, lineHeight: 19 },
  toast: {
    position: 'absolute', bottom: 100, left: 40, right: 40,
    backgroundColor: Brand.ink, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center',
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
