import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface RippleRingProps {
  index: number;
  size: number;
  color: string;
  count: number;
  duration: number;
  thickness: number;
}

function RippleRing({ index, size, color, count, duration, thickness }: RippleRingProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * (duration / count),
      withRepeat(
        withTiming(1, { duration, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(progress);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.25, 2.4]) }],
    opacity: interpolate(progress.value, [0, 0.25, 1], [0, 0.9, 0]),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: thickness,
          borderColor: color,
        },
        animStyle,
      ]}
    />
  );
}

interface RippleRingsProps {
  size: number;
  color?: string;
  count?: number;
  duration?: number;
  thickness?: number;
}

export function RippleRings({
  size,
  color = 'rgba(255,255,255,0.16)',
  count = 4,
  duration = 3600,
  thickness = 1.6,
}: RippleRingsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <RippleRing
          key={i}
          index={i}
          size={size}
          color={color}
          count={count}
          duration={duration}
          thickness={thickness}
        />
      ))}
    </>
  );
}
