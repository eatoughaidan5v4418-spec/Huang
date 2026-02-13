import React from 'react';
import { Box, Text, HStack, Pressable, useColorModeValue, Icon } from 'native-base';
import { Link, usePathname } from 'expo-router';
import { Home, BarChart2 } from 'lucide-react-native';

function TabBarIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return (
    <Icon
      as={name === 'home' ? Home : BarChart2}
      size={6}
      color={focused ? '#1890FF' : color}
    />
  );
}

function TabBarItem({ href, name, label }: { href: string; name: string; label: string }) {
  const pathname = usePathname();
  const focused = pathname === href;
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const activeColor = '#1890FF';

  return (
    <Link href={href as any} asChild>
      <Pressable flex={1} alignItems="center" py={3}>
        <TabBarIcon name={name} focused={focused} color={textColor} />
        <Text
          color={focused ? activeColor : textColor}
          fontSize="xs"
          fontWeight={focused ? 'semibold' : 'normal'}
          mt={1}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

export default function Layout() {
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box flex={1} bg={bgColor}>
      <Box flex={1}>
        <slot />
      </Box>
      <Box
        bg={bgColor}
        borderTopWidth={1}
        borderTopColor={borderColor}
        safeAreaBottom
      >
        <HStack>
          <TabBarItem href="/" name="home" label="首页" />
          <TabBarItem href="/statistics" name="chart" label="统计" />
        </HStack>
      </Box>
    </Box>
  );
}
