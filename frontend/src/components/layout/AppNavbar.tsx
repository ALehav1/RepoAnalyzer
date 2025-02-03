import { Navbar, NavLink, ActionIcon, useMantineColorScheme, Group, Text } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconHome, IconDatabase, IconBulb, IconMessage, IconSun, IconMoon } from '@tabler/icons-react';

export default function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const navItems = [
    { icon: <IconHome size={20} />, label: 'Home', path: '/' },
    { icon: <IconDatabase size={20} />, label: 'Saved Repos', path: '/saved-repos' },
    { icon: <IconBulb size={20} />, label: 'Best Practices', path: '/best-practices' },
    { icon: <IconMessage size={20} />, label: 'Chat', path: '/chat' },
  ];

  return (
    <Navbar width={{ base: 300 }} p="xs">
      <Navbar.Section grow>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            icon={item.icon}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </Navbar.Section>

      <Navbar.Section>
        <Group position="apart" px="sm" py="md">
          <Text size="sm">Theme</Text>
          <ActionIcon
            variant="default"
            onClick={() => toggleColorScheme()}
            size={30}
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </ActionIcon>
        </Group>
      </Navbar.Section>
    </Navbar>
  );
}
