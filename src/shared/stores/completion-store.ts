import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { ActionLevel } from '@/shared/data/actions';

const STORE_KEY = 'ripple_completion';
const MAX_HISTORY = 60;

export interface HistoryEntry {
  actionId: string;
  title: string;
  color: string;
  level: ActionLevel;
  date: string; // ISO date string YYYY-MM-DD
}

interface PersistedData {
  date: string;
  completedToday: boolean;
  completedActionTitle: string | null;
  completedActionId: string | null;
  completionCount: number;
  currentLevel: string;
  streak: number;
  lastCompletedDate: string | null;
  history: HistoryEntry[];
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

type Level = 'SEED' | 'SPARK' | 'WAVE';

function levelFor(count: number): Level {
  if (count >= 9) return 'WAVE';
  if (count >= 3) return 'SPARK';
  return 'SEED';
}

async function load(): Promise<PersistedData | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedData;
  } catch {
    return null;
  }
}

async function save(data: PersistedData): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(data));
  } catch {
    // silently fail — don't block UI
  }
}

interface CompletionState {
  completedToday: boolean;
  completedActionTitle: string | null;
  completedActionId: string | null;
  completionCount: number;
  currentLevel: Level;
  streak: number;
  history: HistoryEntry[];
  initialize: () => Promise<void>;
  setCompleted: (actionTitle: string, actionId: string, color: string, level: ActionLevel) => Level | null;
  resetDay: () => void;
}

export const useCompletionStore = create<CompletionState>((set, get) => ({
  completedToday: false,
  completedActionTitle: null,
  completedActionId: null,
  completionCount: 0,
  currentLevel: 'SEED',
  streak: 0,
  history: [],

  initialize: async () => {
    const data = await load();
    if (!data) return;
    const today = todayStr();
    if (data.date === today) {
      set({
        completedToday: data.completedToday,
        completedActionTitle: data.completedActionTitle,
        completedActionId: data.completedActionId ?? null,
        completionCount: data.completionCount,
        currentLevel: (data.currentLevel as Level) ?? 'SEED',
        streak: data.streak ?? 0,
        history: data.history ?? [],
      });
    } else {
      const streakBroken = data.lastCompletedDate !== yesterdayStr() && data.lastCompletedDate !== today;
      set({
        completedToday: false,
        completedActionTitle: null,
        completedActionId: null,
        completionCount: data.completionCount,
        currentLevel: (data.currentLevel as Level) ?? 'SEED',
        streak: streakBroken ? 0 : (data.streak ?? 0),
        history: data.history ?? [],
      });
    }
  },

  setCompleted: (actionTitle, actionId, color, level) => {
    const prev = get();
    const today = todayStr();
    const newCount = prev.completionCount + 1;
    const newLevel = levelFor(newCount);
    const levelChanged = newLevel !== prev.currentLevel;
    const newStreak = prev.completedToday ? prev.streak : prev.streak + 1;

    // Prepend to history, deduplicate today's entry, cap at MAX_HISTORY
    const filtered = prev.history.filter((h) => h.date !== today);
    const newHistory: HistoryEntry[] = [
      { actionId, title: actionTitle, color, level, date: today },
      ...filtered,
    ].slice(0, MAX_HISTORY);

    const next = {
      completedToday: true,
      completedActionTitle: actionTitle,
      completedActionId: actionId,
      completionCount: newCount,
      currentLevel: newLevel,
      streak: newStreak,
      history: newHistory,
    };
    set(next);
    save({ ...next, date: today, lastCompletedDate: today });
    return levelChanged ? newLevel : null;
  },

  resetDay: () => {
    const prev = get();
    const next = {
      completedToday: false,
      completedActionTitle: null,
      completedActionId: null,
      completionCount: prev.completionCount,
      currentLevel: prev.currentLevel,
      streak: prev.streak,
      history: prev.history,
    };
    set(next);
    save({ ...next, date: todayStr(), lastCompletedDate: todayStr() });
  },
}));
