import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from '@/shared/ui/text';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Brand } from '@/constants/theme';
import { getActionById } from '@/shared/data/actions';
import { useCompletionStore } from '@/shared/stores/completion-store';

// ─── Icon ──────────────────────────────────────────────────────

const IDEA_PATHS: Record<string, string> = {
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-5.99-5.99 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  pen: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z',
  leaf: 'M6.5 17.5C8 12 14 8 20 6c-4 8-8 12-14 14M6.5 17.5 4 20',
  hand: 'M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M6 10V9a2 2 0 0 0-4 0v3a8 8 0 0 0 8 8h2a6 6 0 0 0 6-6v-3',
  heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
};

function IdeaIcon({ name, color }: { name: string; color: string }) {
  const d = IDEA_PATHS[name] ?? IDEA_PATHS.chat;
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24">
      <Path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24">
      <Path d="M20 6 9 17l-5-5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Level badge ───────────────────────────────────────────────

const LEVEL_LABEL: Record<string, string> = {
  SEED: 'Level 1 — Seed',
  SPARK: 'Level 2 — Spark',
  WAVE: 'Level 3 — Wave',
};

// ─── Screen ────────────────────────────────────────────────────

export default function ActionDetailScreen() {
  const { actionId } = useLocalSearchParams<{ actionId: string }>();
  const { bottom } = useSafeAreaInsets();

  const action = getActionById(actionId ?? '') ?? getActionById('thank-someone')!;
  const { completedToday, completedActionId } = useCompletionStore();
  const alreadyDone = completedToday && completedActionId === action.id;

  const handleDone = () => {
    router.push({ pathname: '/celebration', params: { actionId: action.id } } as never);
  };

  return (
    <View style={styles.root}>
      {/* Dark overlay — tap to dismiss */}
      <Pressable style={styles.overlay} onPress={router.back} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Scrollable body */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Level badge */}
          <View style={[styles.levelBadge, { backgroundColor: action.color + '1A' }]}>
            <Text style={[styles.levelText, { color: action.color }]}>
              {LEVEL_LABEL[action.level] ?? action.level}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{action.title}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Why */}
          <Text style={styles.sectionLabel}>Why this matters</Text>
          <Text style={styles.whyText}>{action.why}</Text>

          {/* Ideas */}
          <Text style={[styles.sectionLabel, { marginTop: 26 }]}>Ideas to get started</Text>
          <View style={styles.ideasList}>
            {action.ideas.map((idea, i) => (
              <View key={i} style={styles.ideaCard}>
                <View style={[styles.ideaIconWrap, { backgroundColor: action.color + '16' }]}>
                  <IdeaIcon name={idea.ic} color={action.color} />
                </View>
                <Text style={styles.ideaText}>{idea.t}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Fixed footer */}
        <View style={[styles.footer, { paddingBottom: bottom + 14 }]}>
          {alreadyDone ? (
            <>
              <View style={styles.doneBanner}>
                <CheckIcon />
                <Text style={styles.doneBannerText}>Completed today</Text>
              </View>
              <Pressable onPress={router.back} style={{ alignSelf: 'center', marginTop: 14 }}>
                <Text style={styles.skipLink}>Close</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.primaryBtn} onPress={handleDone}>
                <Text style={styles.primaryBtnText}>I did it</Text>
                <CheckIcon />
              </Pressable>
              <Text style={styles.hint}>Tap when you've completed this action.</Text>
              <Pressable onPress={router.back} style={{ alignSelf: 'center', marginTop: 6 }}>
                <Text style={styles.skipLink}>Not today — remind me tomorrow</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15,15,26,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 44,
    backgroundColor: Brand.softBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 12,
    flexShrink: 0,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Brand.border,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: Brand.ink,
    lineHeight: 30,
    marginTop: 14,
    letterSpacing: -0.4,
  },
  divider: {
    height: 1,
    backgroundColor: Brand.border,
    marginVertical: 22,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Brand.muted,
    textTransform: 'uppercase',
  },
  whyText: {
    fontSize: 16,
    color: Brand.ink,
    lineHeight: 25,
    marginTop: 10,
    fontWeight: '600',
  },
  ideasList: {
    gap: 10,
    marginTop: 12,
  },
  ideaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 14,
    padding: 13,
  },
  ideaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ideaText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: Brand.ink,
    lineHeight: 20,
  },
  doneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.teal + '18',
    borderWidth: 1.5,
    borderColor: Brand.teal + '40',
  },
  doneBannerText: {
    fontSize: 16,
    fontWeight: '800',
    color: Brand.teal,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: 22,
    paddingTop: 14,
    backgroundColor: Brand.card,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Brand.blue,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  hint: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
    color: Brand.muted,
    fontWeight: '600',
  },
  skipLink: {
    fontSize: 13,
    color: Brand.muted,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
