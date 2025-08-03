export const BLOG_CATEGORIES = {
  tips: {
    name: "Tips",
    description: "Quick chess tips and tricks to improve your game",
    slug: "tips"
  },
  news: {
    name: "News", 
    description: "Updates and announcements about Chess Trainer",
    slug: "news"
  },
  guides: {
    name: "Guides",
    description: "In-depth chess tutorials and strategies",
    slug: "guides"
  },
  facts: {
    name: "Fun Facts",
    description: "Interesting chess facts and trivia",
    slug: "facts"
  }
} as const;

export type CategoryKey = keyof typeof BLOG_CATEGORIES;

export const getCategoryInfo = (slug: string) => {
  return Object.values(BLOG_CATEGORIES).find(cat => cat.slug === slug);
};

export const isValidCategory = (slug: string): slug is CategoryKey => {
  return slug in BLOG_CATEGORIES;
};