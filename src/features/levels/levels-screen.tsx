import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from '@/shared/ui/text';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Brand } from '@/constants/theme';
import { useCompletionStore } from '@/shared/stores/completion-store';

function CloseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M18 6 6 18M6 6l12 12" fill="none" stroke={Brand.ink} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

const LEVELS = [
  {
    id: 'SEED',
    label: 'Seed',
    number: 'Level 1',
    color: Brand.teal,
    range: '0 – 2 actions',
    threshold: 3,
    description:
      'Every ripple starts with one small act. Seeds are quick, personal gestures — a thank-you, a compliment, a check-in.',
    examples: ['Thank someone who helped you', 'Give a genuine compliment', 'Check in on someone you've lost touch with', 'Leave a kind review for a local business'],
  },
  {
    id: 'SPARK',
    label: 'Spark',
    number: 'Level 2',
    color: Brand.orange,
    range: '3 – 8 actions',
    threshold: 9,
    description:
      'You're building momentum. Spark actions take a bit more effort and touch more than one person — they create a visible change in your environment.',
    examples: ['Leave a shared space better than you found it', 'Donate something someone else needs more', 'Help a neighbour with a specific task', 'Teach someone a useful skill'],
  },
  {
    id: 'WAVE',
    label: 'Wave',
    number: 'Level 3',
    color: Brand.blue,
    range: '9+ actions',
    threshold: null,
    description:
      'You're creating real change. Wave actions ripple outward — they connect communities, unlock new opportunities, and inspire others to act.',
    examples: ['Give an hour to something bigger than yourself', 'Organise or join a community effort', 'Mentor someone or share expertise', 'Advocate for a cause you care about'],
  },
];

function LevelCard({ level, isActive, isLocked }: {
  level: typeof LEVELS[number];
  isActive: boolean;
  isLocked: boolean;
}) {
  return (
    <View style={[styles.card, isActive && { borderColor: level.color, borderWidth: 2 }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: level.color + '1A' }]}>
          <Text style={[styles.badgeNumber, { color: level.color }]}>{level.number}</Text>
          <Text style={[styles.badgeLabel, { color: level.color }]}>{level.label}</Text>
        </View>
        <View style={styles.headerRight}>
          {isActive && (
            <View style={[styles.activePill, { backgroundColor: level.color }]}>
              <Text style={styles.activePillText}>Current</Text>
            </View>
          )}
          {isLocked && (
            <View style={styles.lockedPill}>
              <Text style={styles.lockedPillText}>Locked</Text>
            </View>
          )}
          <Text style={[styles.range, { color: isLocked ? Brand.muted : Brand.sec }]}>{level.range}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={[styles.desc, isLocked && { color: Brand.muted }]}>{level.description}</Text>

      {/* Examples */}
      <View style={styles.examples}>
        {level.examples.map((ex, i) => (
          <View key={i} style={styles.exampleRow}>
            <View style={[styles.dot, { backgroundColor: isLocked ? Brand.border : level.color }]} />
            <Text style={[styles.exampleText, isLocked && { color: Brand.muted }]}>{ex}</Text>
          </View>
        ))}
      </View>

      {/* Unlock hint */}
      {isLocked && level.threshold !== null && (
        <View style={[styles.unlockHint, { borderColor: level.color + '40' }]}>
          <Text style={[styles.unlockText, { color: level.color }]}>
            Complete {level.threshold} actions to unlock
          </Text>
        </View>
      )}
    </View>
  );
}

export default function LevelsScreen() {
  const { bottom } = useSafeAreaInsets();
  const { completionCount } = useCompletionStore();

  const currentLevelId = completionCount >= 9 ? 'WAVE' : completionCount >= 3 ? 'SPARK' : 'SEED';

  return (
    <View style={styles.root}>
      {/* Handle */}
      <View style={styles.handleRow}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your levels</Text>
          <Text style={styles.subtitle}>Progress through three tiers as you complete more actions.</Text>
        </View>
        <Pressable style={styles.closeBtn} onPress={router.back} hitSlop={12}>
          <CloseIcon />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {LEVELS.map((level) => (
          <LevelCard
            key={level.id}
            level={level}
            isActive={currentLevelId === level.id}
            isLocked={
              (level.id === 'SPARK' && completionCount < 3) ||
              (level.id === 'WAVE' && completionCount < 9)
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.softBg,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Brand.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Brand.ink,
  },
  subtitle: {
    fontSize: 13.5,
    color: Brand.sec,
    fontWeight: '600',
    marginTop: 4,
    maxWidth: 240,
    lineHeight: 19,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    backgroundColor: Brand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 20,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  badgeNumber: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activePill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  lockedPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    backgroundColor: Brand.softBg,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  lockedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Brand.muted,
  },
  range: {
    fontSize: 12,
    fontWeight: '600',
  },
  desc: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.ink,
    lineHeight: 21,
  },
  examples: {
    gap: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  exampleText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: Brand.sec,
    lineHeight: 20,
  },
  unlockHint: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  unlockText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
