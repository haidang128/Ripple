import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import Text from '@/shared/ui/text';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Brand } from '@/constants/theme';
import { useCompletionStore } from '@/shared/stores/completion-store';

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M19 12H5M12 5l-7 7 7 7" fill="none" stroke={Brand.ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M20 6 9 17l-5-5" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = yesterday.toISOString().slice(0, 10);
  if (iso === today) return 'Today';
  if (iso === yesterdayIso) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function levelLabel(level: string): string {
  if (level === 'SEED') return 'Seed';
  if (level === 'SPARK') return 'Spark';
  return 'Wave';
}

export default function HistoryScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { history, completionCount } = useCompletionStore();

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={router.back} hitSlop={12}>
          <BackIcon />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>All completed actions</Text>
          <Text style={styles.subtitle}>{completionCount} total</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>Complete your first action and it will appear here.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {history.map((entry, i) => (
            <Pressable
              key={i}
              style={styles.row}
              onPress={() => router.push({ pathname: '/action-detail', params: { actionId: entry.actionId } } as never)}
            >
              <View style={[styles.icon, { backgroundColor: entry.color + '16' }]}>
                <CheckIcon color={entry.color} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={2}>{entry.title}</Text>
                <Text style={styles.rowDate}>{formatDate(entry.date)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: entry.color + '1A' }]}>
                <Text style={[styles.badgeText, { color: entry.color }]}>{levelLabel(entry.level)}</Text>
              </View>
              <ChevronRightIcon />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.softBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
    backgroundColor: Brand.card,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Brand.softBg, borderWidth: 1, borderColor: Brand.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: Brand.ink },
  subtitle: { fontSize: 12, fontWeight: '600', color: Brand.muted, marginTop: 1 },
  list: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Brand.card, borderWidth: 1, borderColor: Brand.border,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
  },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: Brand.ink, lineHeight: 19 },
  rowDate: { fontSize: 12, color: Brand.muted, fontWeight: '600', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4, flexShrink: 0 },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: Brand.ink, marginBottom: 8 },
  emptyBody: { fontSize: 14, color: Brand.sec, fontWeight: '600', textAlign: 'center', lineHeight: 21 },
});
