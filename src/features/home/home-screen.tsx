import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Text from '@/shared/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Brand, BottomTabInset } from '@/constants/theme';
import { Avatar } from '@/shared/ui/avatar';
import { getDailyActions, ActionData } from '@/shared/data/actions';
import { useDeepLinkStore } from '@/shared/stores/deep-link-store';
import { useCompletionStore } from '@/shared/stores/completion-store';
import { useAuthStore } from '@/shared/stores/auth-store';

type Action = ActionData;

// ─── Helpers ───────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getDateLabel() {
  const d = new Date();
  const day = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  return `${day} · ${month} ${d.getDate()}`;
}

// ─── Icons ─────────────────────────────────────────────────────

function FlameIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24">
      <Path
        d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.5-2 1-2.6C9 10 9.5 11.5 11 12c.6-2.2-1-4 1-9Z"
        fill={Brand.orange}
        stroke={Brand.orange}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LeafIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24">
      <Path d="M5 19c0-7 5-12 14-12 0 9-5 14-12 14-1.5 0-2-1-2-2Z" fill="none" stroke={Brand.blue} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 16c3-3 6-5 9-6" fill="none" stroke={Brand.blue} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

function UsersIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24">
      <Circle cx="9" cy="8" r="3.2" fill="none" stroke={Brand.blue} strokeWidth={1.9} />
      <Path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" fill="none" stroke={Brand.blue} strokeWidth={1.9} strokeLinecap="round" />
      <Path d="M15.5 5.5a3 3 0 0 1 0 5.8M16 14c2.6.3 4.5 2.3 4.5 5" fill="none" stroke={Brand.blue} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

function RippleStatIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="2" fill="none" stroke={Brand.blue} strokeWidth={1.9} />
      <Path d="M12 6.5a5.5 5.5 0 0 1 5.5 5.5M12 3a9 9 0 0 1 9 9" fill="none" stroke={Brand.blue} strokeWidth={1.9} strokeLinecap="round" opacity={0.9} />
      <Path d="M12 6.5A5.5 5.5 0 0 0 6.5 12M12 3a9 9 0 0 0-9 9" fill="none" stroke={Brand.blue} strokeWidth={1.9} strokeLinecap="round" opacity={0.9} />
    </Svg>
  );
}

function ArrowRightIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChainIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        fill="none"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M18 6 6 18M6 6l12 12" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CheckCircleIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={Brand.teal} />
      <Path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function getTomorrowLabel() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// ─── Sub-components ────────────────────────────────────────────

function LevelBadge({ color, label }: { color: string; label: string }) {
  return (
    <View style={[badge.wrap, { backgroundColor: color + '1A' }]}>
      <Text style={[badge.text, { color }]}>{label}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

function StatPill({
  icon,
  value,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={stat.pill} onPress={onPress}>
      {icon}
      <Text style={stat.value}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </Pressable>
  );
}

const stat = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    color: Brand.ink,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Brand.muted,
  },
});

// ─── ActionCard ────────────────────────────────────────────────

function ActionCard({
  action,
  index,
  selected,
  onSelect,
  onStart,
}: {
  action: Action;
  index: number;
  selected: number | null;
  onSelect: () => void;
  onStart: () => void;
}) {
  const isSel = selected === index;
  const isDimmed = selected !== null && !isSel;
  const dimProgress = useSharedValue(0);

  useEffect(() => {
    dimProgress.value = withTiming(isDimmed ? 1 : 0, {
      duration: 350,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [isDimmed]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: 1 - dimProgress.value * 0.6,
    transform: [{ scale: 1 - dimProgress.value * 0.03 }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={[styles.card, isSel && styles.cardSelected]}>
        {/* Level + time */}
        <View style={styles.cardTop}>
          <LevelBadge color={action.color} label={action.level} />
          <Text style={styles.cardTime}>{action.time}</Text>
        </View>

        {/* Text */}
        <Text style={styles.cardTitle}>{action.title}</Text>
        <Text style={styles.cardDesc}>{action.desc}</Text>

        {/* CTA */}
        <View style={{ marginTop: 16 }}>
          {isSel ? (
            <Pressable style={styles.primaryBtn} onPress={onStart}>
              <Text style={styles.primaryBtnText}>Ready — let's do it</Text>
              <ArrowRightIcon />
            </Pressable>
          ) : (
            <Pressable style={styles.outlineBtn} onPress={onSelect}>
              <Text style={styles.outlineBtnText}>Choose this</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Screen ────────────────────────────────────────────────────

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();

  // Consume deep-link context once, then clear
  const { pendingActionId, fromDeepLink, inviterName, clear } = useDeepLinkStore();
  const deepLinkCapture = useRef({ pendingActionId, fromDeepLink, inviterName });

  const dailyActions = getDailyActions();

  const [selected, setSelected] = useState<number | null>(() => {
    if (deepLinkCapture.current.pendingActionId) {
      const idx = dailyActions.findIndex((a) => a.id === deepLinkCapture.current.pendingActionId);
      return idx >= 0 ? idx : null;
    }
    return null;
  });
  const [showBanner, setShowBanner] = useState(deepLinkCapture.current.fromDeepLink);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight);

  const { completedToday, completedActionTitle, completedActionId, completionCount, streak } = useCompletionStore();

  useEffect(() => {
    if (deepLinkCapture.current.fromDeepLink) clear();
  }, []);

  // Update countdown every minute
  useEffect(() => {
    const id = setInterval(() => setCountdown(getTimeUntilMidnight()), 60000);
    return () => clearInterval(id);
  }, []);

  const greeting = getGreeting();
  const dateLabel = getDateLabel();

  const profile = useAuthStore((s) => s.profile);
  const name = profile?.name ?? '';
  const avatarIndex = profile?.avatar_index ?? 0;
  const stats = { actions: completionCount, inspired: 0, reach: 0 };

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar index={avatarIndex} size={40} />
            <Text style={styles.greeting} numberOfLines={1}>
              {greeting}, {name}.
            </Text>
          </View>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <FlameIcon />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
        </View>

        {/* Deep-link banner */}
        {showBanner && deepLinkCapture.current.inviterName && (
          <View style={styles.deepLinkBanner}>
            <ChainIcon />
            <Text style={styles.deepLinkBannerText} numberOfLines={1}>
              <Text style={{ fontWeight: '800' }}>{deepLinkCapture.current.inviterName}</Text>
              {' passed this to you'}
            </Text>
            <Pressable onPress={() => setShowBanner(false)} hitSlop={10}>
              <CloseIcon />
            </Pressable>
          </View>
        )}

        {/* Today label */}
        <View style={{ marginTop: 26 }}>
          <Text style={styles.sectionLabel}>TODAY'S RIPPLE</Text>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>

        {completedToday ? (
          // ── Completed-today view ──────────────────────────────
          <>
            {/* Done card */}
            <Pressable
              style={styles.doneCard}
              onPress={() => completedActionId && router.push({ pathname: '/action-detail', params: { actionId: completedActionId } } as never)}
            >
              <View style={styles.doneCardTop}>
                <CheckCircleIcon />
                <Text style={styles.doneBadge}>Done today</Text>
                <Text style={styles.doneCardHint}>Tap to review</Text>
              </View>
              {completedActionTitle && (
                <Text style={styles.doneActionTitle} numberOfLines={2}>{completedActionTitle}</Text>
              )}
            </Pressable>

            {/* Community pulse */}
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>COMMUNITY TODAY</Text>
              <LinearGradient
                colors={[Brand.blue, Brand.blueDeep]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.communityCard}
              >
                <Text style={styles.communityCount}>8,247</Text>
                <Text style={styles.communityLabel}>ripples created today</Text>
                <View style={styles.communityAvatarRow}>
                  {[0, 2, 4, 6, 1].map((idx) => (
                    <View key={idx} style={styles.communityAvatar}>
                      <Avatar index={idx} size={28} />
                    </View>
                  ))}
                  <Text style={styles.communityMore}>+8,242 more</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Come back tomorrow */}
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>COME BACK TOMORROW</Text>
              <View style={styles.tomorrowCard}>
                <Text style={styles.tomorrowDate}>{getTomorrowLabel()}</Text>
                <View style={styles.countdownPill}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          // ── Normal action cards ───────────────────────────────
          <View style={styles.cards}>
            {dailyActions.map((action, i) => (
              <ActionCard
                key={action.id}
                action={action}
                index={i}
                selected={selected}
                onSelect={() => setSelected(i)}
                onStart={() => router.push({ pathname: '/action-detail', params: { actionId: action.id } } as never)}
              />
            ))}
          </View>
        )}

        {/* Impact stats */}
        <View style={{ marginTop: 22 }}>
          <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>
            YOUR IMPACT SO FAR
          </Text>
          <View style={styles.statRow}>
            <StatPill
              icon={<LeafIcon />}
              value={stats.actions}
              label="actions"
              onPress={() => router.push('/(tabs)/profile' as never)}
            />
            <StatPill
              icon={<UsersIcon />}
              value={stats.inspired}
              label="inspired"
              onPress={() => router.push('/(tabs)/profile' as never)}
            />
            <StatPill
              icon={<RippleStatIcon />}
              value={stats.reach}
              label="reach"
              onPress={() => router.push('/(tabs)/profile' as never)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.softBg,
  },
  content: {
    paddingHorizontal: 20,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.ink,
    flexShrink: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Brand.orange + '18',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '800',
    color: Brand.orange,
  },
  // Section labels
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Brand.muted,
  },
  dateLabel: {
    fontSize: 14,
    color: Brand.sec,
    fontWeight: '700',
    marginTop: 4,
  },
  // Cards
  cards: {
    gap: 14,
    marginTop: 16,
  },
  card: {
    backgroundColor: Brand.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Brand.border,
    shadowColor: '#1A1A2E',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardSelected: {
    borderColor: Brand.blue,
    shadowColor: Brand.blue,
    shadowOpacity: 0.13,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTime: {
    fontSize: 12,
    color: Brand.muted,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Brand.ink,
    lineHeight: 24,
    marginTop: 12,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 14,
    color: Brand.sec,
    lineHeight: 20,
    marginTop: 6,
    fontWeight: '600',
  },
  primaryBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: Brand.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Brand.blue,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#fff',
  },
  outlineBtn: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Brand.blue,
  },
  // Stats
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  // Completed-today
  doneCard: {
    backgroundColor: Brand.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: `${Brand.teal}40`,
    marginTop: 16,
    gap: 8,
  },
  doneCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  doneBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: Brand.teal,
  },
  doneActionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Brand.ink,
    lineHeight: 23,
  },
  doneCardHint: {
    marginLeft: 'auto',
    fontSize: 12,
    fontWeight: '600',
    color: Brand.muted,
  },
  communityCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  communityCount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  communityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  communityAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 4,
  },
  communityAvatar: {
    marginLeft: -6,
    borderWidth: 2,
    borderColor: Brand.blue,
    borderRadius: 16,
  },
  communityMore: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
  },
  tomorrowCard: {
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tomorrowDate: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.ink,
  },
  countdownPill: {
    backgroundColor: Brand.softBg,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '800',
    color: Brand.sec,
  },
  // Deep-link banner
  deepLinkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.teal,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 18,
  },
  deepLinkBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
