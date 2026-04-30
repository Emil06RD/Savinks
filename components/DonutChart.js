import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { theme } from '../constants/theme';

function formatCurrency(value) {
  return `RD$ ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DonutChart({ data, total }) {
  const size = 220;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapSize = 6;
  let cumulativeFraction = 0;

  return (
    <View style={styles.wrapper}>
      <Svg height={size} width={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={theme.colors.track}
            strokeWidth={strokeWidth}
          />

          {data.map((item) => {
            const fraction = total > 0 ? item.value / total : 0;
            const segmentLength = Math.max(circumference * fraction - gapSize, 0);
            const segmentOffset = -cumulativeFraction * circumference;
            cumulativeFraction += fraction;

            return (
              <Circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                fill="none"
                r={radius}
                stroke={item.color}
                strokeDasharray={`${segmentLength} ${circumference}`}
                strokeDashoffset={segmentOffset}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
              />
            );
          })}
        </G>
      </Svg>

      <View style={styles.centerContent}>
        <Text style={styles.centerLabel}>Total gastos</Text>
        <Text style={styles.centerValue}>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: theme.spacing.lg,
  },
  centerContent: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.overlay,
    paddingHorizontal: theme.spacing.sm,
  },
  centerLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  centerValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
});
