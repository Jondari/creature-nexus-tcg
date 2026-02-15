import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, RoundedRect, vec, RadialGradient, Circle } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

interface SkiaFlashOverlayProps {
  color: string;
  flashProgress: SharedValue<number>;
  particleProgress: SharedValue<number>;
  particleCount: number;
}

function generateParticles(count: number) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
    const distance = 20 + Math.random() * 30;
    particles.push({
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      size: 2 + Math.random() * 3,
    });
  }
  return particles;
}

export default function SkiaFlashOverlay({ color, flashProgress, particleProgress, particleCount }: SkiaFlashOverlayProps) {
  const particles = React.useMemo(() => generateParticles(particleCount), [particleCount]);
  const width = 140;
  const height = 180;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Canvas style={styles.canvas}>
        <RoundedRect x={0} y={0} width={width} height={height} r={8} opacity={flashProgress}>
          <RadialGradient
            c={vec(cx, cy)}
            r={Math.max(width, height) * 0.6}
            colors={[color, `${color}00`]}
          />
        </RoundedRect>

        {particles.map((p, i) => (
          <Circle
            key={i}
            cx={cx + p.dx * particleProgress.value}
            cy={cy + p.dy * particleProgress.value}
            r={p.size}
            color={color}
            opacity={particleProgress.value > 0 ? 1 - particleProgress.value * 0.8 : 0}
          />
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
});
