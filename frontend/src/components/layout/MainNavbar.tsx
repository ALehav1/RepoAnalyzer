import { useState } from 'react';
import { Navbar, Group, Code, ScrollArea, createStyles, rem, UnstyledButton, Text } from '@mantine/core';
import {
  IconHome2,
  IconDatabase,
  IconBrain,
  IconMessage,
  IconSettings,
  IconChevronRight,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    paddingBottom: 0,
  },

  header: {
    padding: theme.spacing.md,
    paddingTop: 0,
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  links: {
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
  },

  linksInner: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  link: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: 0,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },

  chevron: {
    transition: 'transform 200ms ease',
  },
}));

interface NavbarLinkProps {
  icon: React.FC<any>;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  const { classes, cx } = useStyles();
  return (
    <UnstyledButton
      onClick={onClick}
      className={cx(classes.link, { [classes.linkActive]: active })}
    >
      <Group>
        <Icon size={20} />
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
  const { classes } = useStyles();
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
    <Navbar height="100vh" width={{ sm: 300 }} p="md" className={classes.navbar}>
      <Navbar.Section className={classes.header}>
        <Group position="apart">
          <Text size="sm" weight={500}>
            Navigation
          </Text>
          <Code sx={{ fontWeight: 700 }}>v{version}</Code>
        </Group>
      </Navbar.Section>

      <Navbar.Section grow className={classes.links} component={ScrollArea}>
        <div className={classes.linksInner}>{links}</div>
      </Navbar.Section>
    </Navbar>
  );
}
