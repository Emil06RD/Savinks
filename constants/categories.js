export const CATEGORY_OPTIONS = [
  { label: 'Comida', icon: '🍔', color: '#22C55E' },
  { label: 'Transporte', icon: '🚗', color: '#38BDF8' },
  { label: 'Estudios', icon: '📚', color: '#A855F7' },
  { label: 'Casa', icon: '🏠', color: '#FACC15' },
  { label: 'Entretenimiento', icon: '🎮', color: '#FB923C' },
  { label: 'Salud', icon: '🏥', color: '#EF4444' },
  { label: 'Otros', icon: '📦', color: '#94A3B8' },
];

export const DEFAULT_CATEGORIES = CATEGORY_OPTIONS.map((item) => item.label);

export function getCategoryMeta(categoryName) {
  return (
    CATEGORY_OPTIONS.find((item) => item.label === categoryName) || CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1]
  );
}
