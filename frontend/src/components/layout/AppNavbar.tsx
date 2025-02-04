import { AppShell, NavLink, ActionIcon, useMantineColorScheme, Group, Text } from '@mantine/core';
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
    <AppShell.Navbar p="xs" width={{ base: 300 }}>
      <AppShell.Section grow>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            leftSection={item.icon}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </AppShell.Section>

      <AppShell.Section>
        <Group justify="center" py="md">
          <ActionIcon
            variant="default"
            onClick={() => toggleColorScheme()}
            size="lg"
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
          <Text size="sm" c="dimmed">
            {colorScheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </Group>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
