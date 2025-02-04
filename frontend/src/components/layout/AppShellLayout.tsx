import { AppShell, useMantineTheme } from '@mantine/core';
import { MainHeader } from './MainHeader';
import { MainNavbar } from './MainNavbar';
import { useState } from 'react';

interface AppShellLayoutProps {
  children: React.ReactNode;
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<MainNavbar />}
      header={<MainHeader />}
    >
      {children}
    </AppShell>
  );
}
