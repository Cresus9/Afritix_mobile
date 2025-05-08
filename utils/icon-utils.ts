import { Music, Clapperboard, Trophy, PartyPopper, Tag } from 'lucide-react-native';

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
      return Tag;
  }
}; 