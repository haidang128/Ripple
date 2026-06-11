import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brand } from '@/constants/theme';

const AV_DATA: { g: [string, string]; mark: 'ring' | 'dot' | 'arc' | 'tri' }[] = [
  { g: [Brand.blue, Brand.teal],       mark: 'ring' },
  { g: ['#FF7043', '#FFB266'],          mark: 'dot'  },
  { g: [Brand.teal, '#62E3CE'],         mark: 'arc'  },
  { g: ['#7C5CFF', Brand.blue],         mark: 'tri'  },
  { g: ['#FF6FA5', '#FF7043'],          mark: 'ring' },
  { g: ['#2DD4BF', Brand.blue],         mark: 'dot'  },
  { g: ['#FFB020', '#FF7043'],          mark: 'arc'  },
  { g: ['#5B8DEF', '#7C5CFF'],          mark: 'tri'  },
];

function Mark({ type, size }: { type: string; size: number }) {
  const w = 'rgba(255,255,255,0.92)';
  if (type === 'ring') {
    const d = size * 0.42;
    return <View style={{ width: d, height: d, borderRadius: d / 2, borderWidth: 2, borderColor: w }} />;
  }
  if (type === 'dot') {
    const d = size * 0.28;
    return <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: w }} />;
  }
  if (type === 'arc') {
    // Approximate arc with a dot
    const d = size * 0.22;
    return <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: w }} />;
  }
  // tri — approximate with a smaller rotated square
  const d = size * 0.26;
  return (
    <View style={{ width: d, height: d, backgroundColor: w, transform: [{ rotate: '45deg' }] }} />
  );
}

interface AvatarProps {
  index?: number;
  size?: number;
  ring?: boolean;
  style?: object;
}

export function Avatar({ index = 0, size = 40, ring = false, style }: AvatarProps) {
  const av = AV_DATA[((index % AV_DATA.length) + AV_DATA.length) % AV_DATA.length];

  const gradient = (
    <LinearGradient
      colors={av.g}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Mark type={av.mark} size={size} />
    </LinearGradient>
  );

  if (!ring) return <View style={[{ width: size, height: size }, style]}>{gradient}</View>;

  // ring = white gap (3px) + blue border (2.5px) — matches prototype's box-shadow double-ring
  return (
    <View
      style={[
        {
          borderRadius: (size + 11) / 2,
          borderWidth: 2.5,
          borderColor: Brand.blue,
          padding: 3,
          backgroundColor: Brand.card,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {gradient}
    </View>
  );
}
