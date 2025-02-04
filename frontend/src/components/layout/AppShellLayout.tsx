import { AppShell } from '@mantine/core';
import { MainHeader } from './MainHeader';
import { MainNavbar } from './MainNavbar';
import { useState } from 'react';

interface AppShellLayoutProps {
  children: React.ReactNode;
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: { base: 300 }, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <MainHeader opened={opened} onToggle={() => setOpened(o => !o)} />
      </AppShell.Header>

      <AppShell.Navbar>
        <MainNavbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
