import React from 'react';
import { Box } from 'native-base';
import {
  Utensils,
  Bus,
  ShoppingBag,
  Film,
  MoreHorizontal,
  Home,
  Heart,
  BookOpen,
  Banknote,
  Gift,
  TrendingUp,
  Briefcase,
} from 'lucide-react-native';

interface CategoryIconProps {
  iconName: string;
  color: string;
  size?: number;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  color,
  size = 20,
}) => {
  const renderIcon = () => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils size={size} color={color} />;
      case 'Bus':
        return <Bus size={size} color={color} />;
      case 'ShoppingBag':
        return <ShoppingBag size={size} color={color} />;
      case 'Film':
        return <Film size={size} color={color} />;
      case 'Home':
        return <Home size={size} color={color} />;
      case 'Heart':
        return <Heart size={size} color={color} />;
      case 'BookOpen':
        return <BookOpen size={size} color={color} />;
      case 'Banknote':
        return <Banknote size={size} color={color} />;
      case 'Gift':
        return <Gift size={size} color={color} />;
      case 'TrendingUp':
        return <TrendingUp size={size} color={color} />;
      case 'Briefcase':
        return <Briefcase size={size} color={color} />;
      case 'MoreHorizontal':
      default:
        return <MoreHorizontal size={size} color={color} />;
    }
  };

  return <Box>{renderIcon()}</Box>;
};

export default CategoryIcon;
