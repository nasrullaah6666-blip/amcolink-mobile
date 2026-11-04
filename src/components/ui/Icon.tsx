import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors, size } from '@/theme/tokens';

export type IconName =
  | 'home' | 'heart' | 'plus' | 'user' | 'bell' | 'search' | 'chevronDown' | 'chevronLeft' | 'chevronRight'
  | 'filters' | 'house' | 'tools' | 'phone' | 'tv' | 'sofa' | 'shirt' | 'bottle' | 'car' | 'leaf' | 'hammer'
  | 'grid' | 'compass' | 'call' | 'whatsapp' | 'map' | 'share' | 'flag' | 'more';

/** One icon set, one stroke style. Colour defaults to the main text colour. */
export function Icon({ name, color = colors.text, size: s = size.icon, strokeWidth = 1.8 }: { name: IconName; color?: string; size?: number; strokeWidth?: number }) {
  const p = { stroke: color, strokeWidth, fill: 'none' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {name === 'home' || name === 'house' ? <Path {...p} d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> : null}
      {name === 'heart' ? <Path {...p} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /> : null}
      {name === 'plus' ? <Path {...p} d="M12 5v14M5 12h14" /> : null}
      {name === 'user' ? <><Circle {...p} cx="12" cy="8" r="4" /><Path {...p} d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></> : null}
      {name === 'bell' ? <><Path {...p} d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><Path {...p} d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></> : null}
      {name === 'search' ? <><Circle {...p} cx="11" cy="11" r="7" /><Path {...p} d="m20 20-3.5-3.5" /></> : null}
      {name === 'chevronDown' ? <Path {...p} d="m6 9 6 6 6-6" /> : null}
      {name === 'chevronLeft' ? <Path {...p} d="m15 18-6-6 6-6" /> : null}
      {name === 'chevronRight' ? <Path {...p} d="m9 18 6-6-6-6" /> : null}
      {name === 'filters' ? <Path {...p} d="M4 6h16M7 12h10M10 18h4" /> : null}
      {name === 'tools' ? <Path {...p} d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" /> : null}
      {name === 'phone' ? <><Rect {...p} x="6" y="2.5" width="12" height="19" rx="2.5" /><Path {...p} d="M11 18.5h2" /></> : null}
      {name === 'tv' ? <><Rect {...p} x="2.5" y="4" width="19" height="13" rx="2" /><Path {...p} d="M8 21h8M12 17v4" /></> : null}
      {name === 'sofa' ? <><Path {...p} d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" /><Rect {...p} x="2.5" y="11" width="19" height="6" rx="2" /><Path {...p} d="M5 17v2M19 17v2" /></> : null}
      {name === 'shirt' ? <Path {...p} d="M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3a4 4 0 0 1-8 0z" /> : null}
      {name === 'bottle' ? <><Rect {...p} x="8" y="9" width="8" height="12" rx="2" /><Path {...p} d="M10 9V6h4v3M11 3h2" /></> : null}
      {name === 'car' ? <><Path {...p} d="M5 17H3v-5l2-5h11l3 5h2v5h-2" /><Circle {...p} cx="7.5" cy="17.5" r="2" /><Circle {...p} cx="16.5" cy="17.5" r="2" /></> : null}
      {name === 'leaf' ? <><Path {...p} d="M12 21V11" /><Path {...p} d="M12 11C12 7 9 4 5 4c0 4 3 7 7 7zM12 13c0-3 2.5-5.5 6-5.5 0 3-2.5 5.5-6 5.5z" /></> : null}
      {name === 'hammer' ? <Path {...p} d="m14 4 6 6-3 3-6-6zM11 7 3 15l3 3 8-8" /> : null}
      {name === 'grid' ? <><Rect {...p} x="4" y="4" width="7" height="7" rx="1.5" /><Rect {...p} x="13" y="4" width="7" height="7" rx="1.5" /><Rect {...p} x="4" y="13" width="7" height="7" rx="1.5" /><Rect {...p} x="13" y="13" width="7" height="7" rx="1.5" /></> : null}
      {name === 'compass' ? <><Circle {...p} cx="12" cy="12" r="9" /><Path {...p} d="m15.5 8.5-2 5-5 2 2-5z" /></> : null}
      {name === 'call' ? <Path {...p} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /> : null}
      {name === 'whatsapp' ? <Path {...p} d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.7z" /> : null}
      {name === 'map' ? <><Path {...p} d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><Circle {...p} cx="12" cy="9" r="2.5" /></> : null}
      {name === 'share' ? <><Path {...p} d="M12 3v12M7 8l5-5 5 5" /><Path {...p} d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></> : null}
      {name === 'flag' ? <Path {...p} d="M5 21V4M5 4h11l-2 4 2 4H5" /> : null}
      {name === 'more' ? <><Circle cx="5" cy="12" r="2" fill={color} /><Circle cx="12" cy="12" r="2" fill={color} /><Circle cx="19" cy="12" r="2" fill={color} /></> : null}
    </Svg>
  );
}
