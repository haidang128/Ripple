import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing as EasingRN,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Text from '@/shared/ui/text';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import AnimatedRN from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Brand, BottomTabInset } from '@/constants/theme';
import { Avatar } from '@/shared/ui/avatar';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useCompletionStore } from '@/shared/stores/completion-store';

// ─── Level helpers ─────────────────────────────────────────────

function getLevelInfo(count: number) {
  if (count >= 9) {
    return { label: 'Level 3 — Wave', next: null, pct: Math.min(1, (count - 9) / 21), color: Brand.blue };
  }
  if (count >= 3) {
    return { label: 'Level 2 — Spark', next: 'Wave', pct: (count - 3) / 6, color: Brand.orange };
  }
  return { label: 'Level 1 — Seed', next: 'Spark', pct: count / 3, color: Brand.teal };
}

function formatSince(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ─── Icons ─────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24">
      <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" fill="none" stroke={Brand.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FlameIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24">
      <Path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.5-2 1-2.6C9 10 9.5 11.5 11 12c.6-2.2-1-4 1-9Z" fill={Brand.orange} stroke={Brand.orange} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24">
      <Path d="M20 6 9 17l-5-5" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SmallCheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path d="M20 6 9 17l-5-5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M9 18l6-6-6-6" fill="none" stroke={Brand.muted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Empty states ──────────────────────────────────────────────

function EmptyChain() {
  return (
    <View style={emptyStyles.root}>
      <View style={emptyStyles.iconWrap}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke={Brand.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke={Brand.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      <Text style={emptyStyles.title}>No chain yet</Text>
      <Text style={emptyStyles.body}>Complete your first action and share it to start inspiring others.</Text>
    </View>
  );
}

function EmptyStreak() {
  return (
    <View style={emptyStyles.root}>
      <View style={emptyStyles.iconWrap}>
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <Path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.5-2 1-2.6C9 10 9.5 11.5 11 12c.6-2.2-1-4 1-9Z" fill={Brand.muted} strokeWidth={0} />
        </Svg>
      </View>
      <Text style={emptyStyles.title}>Start your streak today</Text>
      <Text style={emptyStyles.body}>Complete one action each day to build your streak and track your progress here.</Text>
    </View>
  );
}

function EmptyRecent() {
  return (
    <View style={emptyStyles.root}>
      <Text style={emptyStyles.body}>No completed actions yet. Complete your first action today.</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  root: { paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Brand.softBg, borderWidth: 1, borderColor: Brand.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: '800', color: Brand.ink, marginBottom: 4 },
  body: { fontSize: 13.5, color: Brand.sec, fontWeight: '600', textAlign: 'center', lineHeight: 19, maxWidth: 240 },
});

// ─── Section label ─────────────────────────────────────────────

function SectionLabel({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{children.toUpperCase()}</Text>
      {right}
    </View>
  );
}

// ─── Streak grid ───────────────────────────────────────────────

function TodayCell() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <AnimatedRN.View style={[styles.streakCell, styles.streakCellToday, style]} />;
}

function StreakGrid({ doneDates, streak }: { doneDates: Set<string>; streak: number }) {
  // Build last-30-days array (index 0 = 29 days ago, index 29 = today)
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const todayIso = new Date().toISOString().slice(0, 10);
  const longestStreak = streak; // approximate with current streak for now

  return (
    <View>
      <View style={styles.streakGrid}>
        {days.map((iso, i) => {
          const isToday = iso === todayIso;
          const isDone = doneDates.has(iso);
          if (isToday) return <TodayCell key={i} />;
          if (isDone) {
            return (
              <View key={i} style={[styles.streakCell, styles.streakCellDone]}>
                <SmallCheckIcon />
              </View>
            );
          }
          return <View key={i} style={[styles.streakCell, styles.streakCellEmpty]} />;
        })}
      </View>
      <View style={styles.streakFooter}>
        <FlameIcon />
        <Text style={styles.streakFooterText}>Current streak: {streak} day{streak !== 1 ? 's' : ''}</Text>
      </View>
    </View>
  );
}

// ─── Chain tree (aspirational — shows empty until social sharing backend) ──

function ChainTree({ avatarIndex }: { avatarIndex: number }) {
  return (
    <View style={styles.treeWrap}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={280} height={192} viewBox="0 0 280 192" style={{ alignSelf: 'center' }}>
          <Path d="M140 34 Q90 50 72 78" fill="none" stroke={Brand.blue} strokeWidth={2} strokeOpacity={0.4} />
          <Path d="M140 34 Q140 56 140 76" fill="none" stroke={Brand.blue} strokeWidth={2} strokeOpacity={0.4} />
          <Path d="M140 34 Q190 50 208 78" fill="none" stroke={Brand.blue} strokeWidth={2} strokeOpacity={0.4} />
          <Path d="M72 92 Q56 124 48 140" fill="none" stroke={Brand.teal} strokeWidth={1.6} strokeOpacity={0.4} />
          <Path d="M72 92 Q88 124 96 140" fill="none" stroke={Brand.teal} strokeWidth={1.6} strokeOpacity={0.4} />
          <Path d="M140 90 Q140 120 140 138" fill="none" stroke={Brand.teal} strokeWidth={1.6} strokeOpacity={0.4} />
          <Path d="M208 92 Q224 124 232 140" fill="none" stroke={Brand.teal} strokeWidth={1.6} strokeOpacity={0.4} />
        </Svg>
      </View>
      <View style={{ position: 'absolute', left: 116, top: 8, zIndex: 2 }}>
        <Avatar index={avatarIndex} size={48} ring />
      </View>
      {([[ 54, 2 ], [122, 4], [190, 6]] as [number, number][]).map(([l, ix], i) => (
        <View key={i} style={{ position: 'absolute', left: l, top: 70, zIndex: 2 }}>
          <Avatar index={ix} size={36} />
        </View>
      ))}
      {([[ 36, 1], [84, 3], [128, 5], [220, 7]] as [number, number][]).map(([l, ix], i) => (
        <View key={i} style={{ position: 'absolute', left: l, top: 138, zIndex: 2 }}>
          <Avatar index={ix} size={24} />
        </View>
      ))}
      <View style={{ position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' }}>
        <View style={styles.moreBadge}>
          <Text style={styles.moreBadgeText}>Share an action to start your chain</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Recent action row ─────────────────────────────────────────

function RecentRow({ title, color, level, date, onPress }: {
  title: string; color: string; level: string; date: string; onPress: () => void;
}) {
  const levelLabel = level === 'SEED' ? 'Seed' : level === 'SPARK' ? 'Spark' : 'Wave';
  return (
    <Pressable style={styles.recentRow} onPress={onPress}>
      <View style={[styles.recentIcon, { backgroundColor: color + '16' }]}>
        <CheckIcon color={color} />
      </View>
      <View style={styles.recentText}>
        <Text style={styles.recentTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.recentDate}>{date}</Text>
      </View>
      <View style={[styles.recentBadge, { backgroundColor: color + '1A' }]}>
        <Text style={[styles.recentBadgeText, { color }]}>{levelLabel}</Text>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

// ─── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (iso === today.toISOString().slice(0, 10)) return 'Today';
  if (iso === yesterday.toISOString().slice(0, 10)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Screen ────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();

  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);
  const { completionCount, streak, history } = useCompletionStore();

  const name = profile?.name ?? '';
  const avatarIndex = profile?.avatar_index ?? 0;
  const since = session?.user?.created_at ? formatSince(session.user.created_at) : '';
  const isNewUser = completionCount === 0;

  const level = getLevelInfo(completionCount);
  const pctLabel = Math.round(level.pct * 100);

  // Build set of completed date strings for the streak grid
  const doneDates = new Set(history.map((h) => h.date));

  // Last 3 history entries for preview
  const recentThree = history.slice(0, 3);

  // Animated level bar
  const barWidth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: level.pct * 100,
      duration: 1100,
      delay: 400,
      easing: EasingRN.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [level.pct]);
  const animatedBarWidth = barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: BottomTabInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar index={avatarIndex} size={64} />
            <View>
              <Text style={styles.userName}>{name}</Text>
              {since ? <Text style={styles.userSince}>Rippling since {since}</Text> : null}
            </View>
          </View>
          <Pressable style={styles.editBtn} onPress={() => router.push('/settings' as never)}>
            <PencilIcon />
          </Pressable>
        </View>

        {/* Impact card */}
        <LinearGradient
          colors={[Brand.blue, '#155CA8']}
          start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={styles.impactCard}
        >
          <View style={styles.impactRingsWrap} pointerEvents="none">
            <Svg width={180} height={180} viewBox="0 0 180 180">
              {[36, 60, 84].map((r, i) => (
                <Circle key={i} cx={90} cy={90} r={r} fill="none" stroke="#fff" strokeWidth={2} opacity={0.2} />
              ))}
            </Svg>
          </View>
          <Text style={styles.impactLabel}>Your impact</Text>
          <View style={styles.impactStats}>
            {[
              [completionCount, 'Actions completed'],
              [0, 'People inspired'],
              [0, 'Total reach'],
            ].map(([v, l], i) => (
              <View key={i} style={{ flex: 1 }}>
                <Text style={styles.impactValue}>{v}</Text>
                <Text style={styles.impactStatLabel}>{l}</Text>
              </View>
            ))}
          </View>
          <View style={styles.impactDivider} />
          <Text style={styles.impactStreak}>
            {streak > 0
              ? `You've completed ${streak} consecutive day${streak !== 1 ? 's' : ''}.`
              : 'Complete your first action today.'}
          </Text>
        </LinearGradient>

        {/* Level progress */}
        <Pressable style={styles.levelCard} onPress={() => router.push('/levels' as never)}>
          <View style={styles.levelHeader}>
            <View style={[styles.levelBadge, { backgroundColor: level.color + '1A' }]}>
              <Text style={[styles.levelBadgeText, { color: level.color }]}>{level.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.levelPct}>{pctLabel}%</Text>
              <ChevronRightIcon />
            </View>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.bar, { width: animatedBarWidth, backgroundColor: level.color }]} />
          </View>
          <Text style={styles.levelHint}>
            {level.next
              ? <Text style={{ fontWeight: '700', color: Brand.sec }}>{pctLabel}% to {level.next}. </Text>
              : <Text style={{ fontWeight: '700', color: Brand.sec }}>Maximum level reached. </Text>}
            Tap to see all levels.
          </Text>
        </Pressable>

        {/* Chain tree */}
        <SectionLabel>Your ripple chain</SectionLabel>
        <View style={styles.card}>
          {isNewUser ? <EmptyChain /> : <ChainTree avatarIndex={avatarIndex} />}
        </View>

        {/* Streak grid */}
        <SectionLabel>Last 30 days</SectionLabel>
        <View style={[styles.card, styles.cardPad]}>
          {isNewUser ? <EmptyStreak /> : <StreakGrid doneDates={doneDates} streak={streak} />}
        </View>

        {/* Recently completed */}
        <SectionLabel right={
          history.length > 3 ? (
            <Pressable onPress={() => router.push('/history' as never)}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          ) : null
        }>
          Recently completed
        </SectionLabel>

        {recentThree.length === 0 ? (
          <View style={[styles.card, { overflow: 'hidden' }]}>
            <EmptyRecent />
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentThree.map((entry, i) => (
              <RecentRow
                key={i}
                title={entry.title}
                color={entry.color}
                level={entry.level}
                date={formatDate(entry.date)}
                onPress={() => router.push({ pathname: '/action-detail', params: { actionId: entry.actionId } } as never)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.softBg },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  userName: { fontSize: 22, fontWeight: '800', color: Brand.ink },
  userSince: { fontSize: 12, color: Brand.muted, fontWeight: '600', marginTop: 2 },
  editBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: Brand.border, backgroundColor: Brand.card,
    alignItems: 'center', justifyContent: 'center',
  },
  impactCard: {
    borderRadius: 22, padding: 22, marginTop: 22, overflow: 'hidden',
    shadowColor: Brand.blue, shadowOpacity: 0.2, shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  impactRingsWrap: { position: 'absolute', top: -50, right: -50 },
  impactLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  impactStats: { flexDirection: 'row', marginTop: 16 },
  impactValue: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  impactStatLabel: { fontSize: 11.5, fontWeight: '600', color: 'rgba(255,255,255,0.82)', marginTop: 2, lineHeight: 16 },
  impactDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 18, marginBottom: 14 },
  impactStreak: { fontSize: 13.5, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  levelCard: {
    backgroundColor: Brand.card, borderWidth: 1, borderColor: Brand.border,
    borderRadius: 20, padding: 20, marginTop: 14,
  },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  levelBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  levelPct: { fontSize: 13, fontWeight: '800', color: Brand.sec },
  track: { height: 9, backgroundColor: Brand.softBg, borderRadius: 5, marginTop: 14, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 5 },
  levelHint: { fontSize: 12.5, color: Brand.muted, fontWeight: '600', marginTop: 10, lineHeight: 18 },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 26, marginBottom: 12,
  },
  sectionLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: Brand.muted },
  seeAll: { fontSize: 13, color: Brand.blue, fontWeight: '700' },
  card: { backgroundColor: Brand.card, borderWidth: 1, borderColor: Brand.border, borderRadius: 20, overflow: 'hidden' },
  cardPad: { padding: 20 },
  treeWrap: { height: 192, width: 280, alignSelf: 'center' },
  moreBadge: {
    backgroundColor: Brand.softBg, borderRadius: 999, borderWidth: 1,
    borderColor: Brand.border, paddingHorizontal: 14, paddingVertical: 5,
  },
  moreBadgeText: { fontSize: 11, fontWeight: '700', color: Brand.muted },
  streakGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  streakCell: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  streakCellDone: { backgroundColor: Brand.blue },
  streakCellEmpty: { borderWidth: 1.5, borderColor: Brand.border },
  streakCellToday: { borderWidth: 2, borderColor: Brand.blue },
  streakFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  streakFooterText: { fontSize: 12.5, color: Brand.muted, fontWeight: '600' },
  recentList: { gap: 10 },
  recentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Brand.card, borderWidth: 1, borderColor: Brand.border,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
  },
  recentIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  recentText: { flex: 1, minWidth: 0 },
  recentTitle: { fontSize: 14, fontWeight: '700', color: Brand.ink, lineHeight: 18 },
  recentDate: { fontSize: 12, color: Brand.muted, fontWeight: '600', marginTop: 2 },
  recentBadge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4, flexShrink: 0 },
  recentBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
});
