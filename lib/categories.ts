import { Music, Clapperboard, Trophy, PartyPopper } from 'lucide-react-native';

export const categories = [
  {
    id: 1,
    name: 'Music Concerts',
    icon: 'music',
    description: 'Live performances from top artists',
    subcategories: ['Afrobeats', 'Jazz', 'Traditional']
  },
  {
    id: 2,
    name: 'Cinema',
    icon: 'clapperboard',
    description: 'Movie premieres and film festivals',
    subcategories: ['Premieres', 'Film Festivals', 'Screenings']
  },
  {
    id: 3,
    name: 'Sports',
    icon: 'trophy',
    description: 'Major sporting events',
    subcategories: ['Football', 'Athletics', 'Boxing']
  },
  {
    id: 4,
    name: 'Festivals',
    icon: 'party-popper',
    description: 'Cultural celebrations and festivals',
    subcategories: ['Cultural', 'Food', 'Art', 'Music']
  }
];

export type Category = typeof categories[0];

export const getIcon = (iconName: string) => {
  switch (iconName.toLowerCase()) {
    case 'music':
      return Music;
    case 'clapperboard':
      return Clapperboard;
    case 'trophy':
      return Trophy;
    case 'party-popper':
      return PartyPopper;
    default:
      return Music; // Fallback icon
  }
};

export const getCategoryById = (id: number) => {
  return categories.find(category => category.id === id);
};

export const getCategoryByName = (name: string) => {
  return categories.find(category => category.name.toLowerCase() === name.toLowerCase());
}; 