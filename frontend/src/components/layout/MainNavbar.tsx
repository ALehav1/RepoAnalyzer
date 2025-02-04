import { useState } from 'react';
import { Group, Code, UnstyledButton, Text } from '@mantine/core';
import {
  IconHome2,
  IconDatabase,
  IconBrain,
  IconMessage,
  IconSettings,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './MainNavbar.module.css';

interface NavbarLinkProps {
  icon: React.ComponentType<any>;
  label: string;
  active?: boolean;
  onClick(): void;
}

export function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      className={classes.link}
      data-active={active || undefined}
    >
      <Group>
        <Icon size={20} stroke={1.5} />
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

const navItems = [
  { icon: IconHome2, label: 'Home', path: '/' },
  { icon: IconDatabase, label: 'Saved Repositories', path: '/saved-repos' },
  { icon: IconBrain, label: 'Best Practices', path: '/best-practices' },
  { icon: IconMessage, label: 'Chat', path: '/chat' },
  { icon: IconSettings, label: 'Settings', path: '/settings' },
];

export function MainNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [version] = useState('0.1.0');

  const links = navItems.map((item) => (
    <NavbarLink
      {...item}
      key={item.label}
      active={location.pathname === item.path}
      onClick={() => navigate(item.path)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group position="apart">
          <Text size="sm" fw={500}>
            Navigation
          </Text>
          <Code fw={700}>v{version}</Code>
        </Group>
      </div>

      <div className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </div>
    </nav>
  );
}
