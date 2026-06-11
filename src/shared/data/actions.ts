import { Brand } from '@/constants/theme';

export type ActionLevel = 'SEED' | 'SPARK' | 'WAVE';

export interface ActionData {
  id: string;
  level: ActionLevel;
  time: string;
  color: string;
  title: string;
  desc: string;
  why: string;
  ideas: { ic: string; t: string }[];
}

export const ACTIONS: ActionData[] = [
  {
    id: 'thank-someone',
    level: 'SEED',
    time: '~5 min',
    color: Brand.teal,
    title: 'Thank someone who helped you recently.',
    desc: 'A text, a note, a quick call. Small things land big.',
    why: 'Gratitude strengthens relationships and improves your own mood. Studies show that expressing thanks reduces stress within minutes.',
    ideas: [
      { ic: 'chat', t: 'Send a text saying one specific thing you appreciated' },
      { ic: 'phone', t: "Give a 2-minute call to someone you haven't spoken to recently" },
      { ic: 'pen', t: "Write a handwritten note and leave it somewhere they'll find it" },
    ],
  },
  {
    id: 'shared-space',
    level: 'SPARK',
    time: '~10 min',
    color: Brand.orange,
    title: 'Leave one shared space better than you found it.',
    desc: 'Tidy a bench, a hallway, a sidewalk. Quiet care counts.',
    why: 'Small acts of care for shared spaces build a sense of belonging — for you and everyone who passes through after you.',
    ideas: [
      { ic: 'leaf', t: 'Pick up a few pieces of litter on your street' },
      { ic: 'hand', t: 'Straighten a shared shelf, table, or common area' },
      { ic: 'heart', t: 'Leave something useful for the next person' },
    ],
  },
  {
    id: 'check-in',
    level: 'SEED',
    time: '~3 min',
    color: Brand.teal,
    title: "Check in on someone you've lost touch with.",
    desc: "One honest 'how are you?' can change a whole day.",
    why: 'Reconnecting reminds people they matter. A short, genuine message often means far more than we expect it to.',
    ideas: [
      { ic: 'chat', t: 'Send a "you crossed my mind today" message' },
      { ic: 'phone', t: 'Ask one real question and actually listen' },
      { ic: 'heart', t: 'Share a memory you think of when you think of them' },
    ],
  },
  {
    id: 'compliment-stranger',
    level: 'SEED',
    time: '~2 min',
    color: Brand.teal,
    title: 'Give a genuine compliment to someone today.',
    desc: 'Not a pleasantry — something real you noticed about them.',
    why: 'A sincere compliment can shift someone\'s entire day. Research shows givers underestimate the positive impact by nearly half.',
    ideas: [
      { ic: 'heart', t: 'Notice something specific — their work, effort, or a choice they made' },
      { ic: 'chat', t: 'Say it out loud, not just in your head' },
      { ic: 'pen', t: 'Write it in a message if saying it in person feels hard' },
    ],
  },
  {
    id: 'local-business',
    level: 'SEED',
    time: '~5 min',
    color: Brand.teal,
    title: 'Leave a kind review for a local business you love.',
    desc: 'Five stars and a few genuine sentences can keep a small business alive.',
    why: 'Independent businesses live or die by word of mouth. A single review can bring in customers they'd never reach otherwise.',
    ideas: [
      { ic: 'pen', t: 'Write something specific — what made it good?' },
      { ic: 'chat', t: 'Mention a person by name if they helped you' },
      { ic: 'heart', t: 'Share the review on your social feed too' },
    ],
  },
  {
    id: 'donate-item',
    level: 'SPARK',
    time: '~15 min',
    color: Brand.orange,
    title: 'Find one thing to donate that someone else needs more.',
    desc: 'A book, a jacket, a kitchen item. Clear space and create value.',
    why: 'The average household has 300,000 items. Donating one thing creates real impact — and research links decluttering with reduced anxiety.',
    ideas: [
      { ic: 'leaf', t: 'Check your closet for something unworn in 6 months' },
      { ic: 'hand', t: 'Look for a local shelter, library, or community box' },
      { ic: 'heart', t: 'Give it directly to someone you know who needs it' },
    ],
  },
  {
    id: 'teach-something',
    level: 'SPARK',
    time: '~20 min',
    color: Brand.orange,
    title: 'Teach someone one useful thing you know.',
    desc: 'A skill, a shortcut, a recipe. Knowledge grows when shared.',
    why: 'Sharing knowledge has a compounding effect — the person you teach may pass it on to dozens more over their lifetime.',
    ideas: [
      { ic: 'chat', t: 'Think of the most useful thing you learned this year' },
      { ic: 'phone', t: "Offer to walk someone through it — don't just describe it" },
      { ic: 'pen', t: 'Write a quick how-to and share it somewhere it will help others' },
    ],
  },
  {
    id: 'help-neighbor',
    level: 'SPARK',
    time: '~20 min',
    color: Brand.orange,
    title: 'Offer one specific, concrete help to a neighbour.',
    desc: "Don't ask if they need help — notice something and offer to do it.",
    why: 'Vague offers ("let me know if you need anything") rarely lead to action. Specific offers get accepted 3× more often.',
    ideas: [
      { ic: 'hand', t: 'Carry something heavy, watch their kids, get groceries' },
      { ic: 'leaf', t: 'Offer to handle a task they've been putting off' },
      { ic: 'heart', t: 'Introduce yourself if you haven't — sometimes that's the whole thing' },
    ],
  },
  {
    id: 'volunteer-hour',
    level: 'WAVE',
    time: '~1 hr',
    color: Brand.blue,
    title: 'Give one hour to something bigger than yourself.',
    desc: 'Volunteer, organise, show up. One hour multiplied by millions changes the world.',
    why: 'People who volunteer regularly report higher life satisfaction than those who don\'t — even when controlling for income and health.',
    ideas: [
      { ic: 'heart', t: 'Find a local food bank, shelter, or community garden' },
      { ic: 'hand', t: 'Offer a skill pro-bono to a nonprofit — design, writing, tech' },
      { ic: 'leaf', t: 'Join a clean-up or planting event in your area' },
    ],
  },
];

function getDayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export function getDailyActions(): ActionData[] {
  const day = getDayIndex();
  const n = ACTIONS.length;
  const i0 = (day * 3) % n;
  const i1 = (i0 + 1) % n;
  const i2 = (i0 + 2) % n;
  return [ACTIONS[i0], ACTIONS[i1], ACTIONS[i2]];
}

export function getActionById(id: string): ActionData | undefined {
  return ACTIONS.find(a => a.id === id);
}
