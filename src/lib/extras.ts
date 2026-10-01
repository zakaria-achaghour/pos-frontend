import type { TFunction } from 'i18next';

/**
 * Common add-ons. The English string is the stored value (what the kitchen ticket and
 * backend receive), so it stays stable whatever language each screen uses;
 * `extraLabel` translates it for display.
 */
export const EXTRAS = [
  { slug: 'cheese', value: 'Extra Cheese' },
  { slug: 'sauce', value: 'Extra Sauce' },
  { slug: 'spicy', value: 'Extra Spicy' },
  { slug: 'veggies', value: 'Extra Veggies' },
  { slug: 'meat', value: 'Extra Meat' },
  { slug: 'bacon', value: 'Bacon' },
  { slug: 'avocado', value: 'Avocado' },
  { slug: 'egg', value: 'Fried Egg' },
] as const;

export const extraLabel = (t: TFunction, value: string): string => {
  const known = EXTRAS.find((e) => e.value === value);
  return known ? t(`extras.${known.slug}`, { defaultValue: value }) : value;
};
