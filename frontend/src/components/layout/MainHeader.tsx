import { AppShell, Group, Text, ActionIcon, useMantineColorScheme, Box, Button, Burger } from '@mantine/core';
import { IconSun, IconMoon, IconBrandGithub } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface MainHeaderProps {
  opened: boolean;
  onToggle: () => void;
}

export function MainHeader({ opened, onToggle }: MainHeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();

  return (
    <AppShell.Header height={60} px="md">
      <Group position="apart" sx={{ height: '100%' }}>
        <Group>
          <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />
          <Box
            component="img"
            src="/logo.svg"
            alt="RepoAnalyzer Logo"
            sx={{ width: 32, height: 32, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          />
          <Text
            size="xl"
            weight={700}
            variant="gradient"
            gradient={{ from: 'brand.7', to: 'brand.5', deg: 45 }}
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            RepoAnalyzer
          </Text>
        </Group>

        <Group>
          <Button
            component="a"
            href="https://github.com/ALehav1/RepoAnalyzer"
            target="_blank"
            rel="noopener noreferrer"
            leftSection={<IconBrandGithub size={20} />}
          >
            View Source
          </Button>
          
          <ActionIcon
            variant="light"
            color="brand"
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
            size="lg"
          >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
