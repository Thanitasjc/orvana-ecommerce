const COLOR_HEX_MAP: Record<string, string> = {
  white: "#FFFFFF",
  cream: "#F5F0E6",
  black: "#1F2937",
  "charcoal black": "#374151",
  gray: "#CBCBCB",
  "heather gray": "#B8B8B8",
  grey: "#CBCBCB",
  navy: "#1E3A5F",
  "navy blue": "#1E3A5F",
  blue: "#3B82F6",
  red: "#DC2626",
  pink: "#F9A8D4",
  "blush pink": "#F9A8D4",
  green: "#16A34A",
  "olive green": "#6B7C3B",
  olive: "#6B7C3B",
  brown: "#92400E",
  tan: "#D2B48C",
  "tan gold": "#D4AF37",
  "warm taupe": "#B8A99A",
  khaki: "#C3B091",
  "sand khaki": "#C2B280",
  "army green": "#4B5320",
  indigo: "#4F46E5",
  "indigo wash": "#6366F1",
  oatmeal: "#E8DCC8",
  yellow: "#F8B655",
  coral: "#FF7F50",
  orange: "#F97316",
  "matte black": "#111827",
  "light acid wash": "#93C5FD",
  "one size": "#94A3B8",
};

function hashColor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 45% 45%)`;
}

export function colorNameToHex(color: string) {
  const normalized = color.trim().toLowerCase();
  return COLOR_HEX_MAP[normalized] ?? hashColor(normalized);
}

export function uniqueVariationColors(colors: Array<string | null | undefined>) {
  return [...new Set(colors.map((value) => value?.trim()).filter(Boolean))] as string[];
}

export function galleryIndexForColor(color: string, colors: string[], galleryLength: number) {
  if (galleryLength <= 0) return 0;
  const colorIndex = colors.indexOf(color);
  if (colorIndex === -1) return 0;
  return Math.min(colorIndex, galleryLength - 1);
}
