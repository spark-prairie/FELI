import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path } from 'react-native-svg';

export function History({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path
        d="M12 7v5l3 3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
