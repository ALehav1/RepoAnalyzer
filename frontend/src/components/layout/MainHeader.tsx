import { Header, Group, Text, ActionIcon, useMantineColorScheme, Box, Button } from '@mantine/core';
import { IconSun, IconMoon, IconBrandGithub } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function MainHeader() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();

  return (
    <Header height={60} px="md">
      <Group position="apart" sx={{ height: '100%' }}>
        <Group>
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
            variant="subtle"
            leftIcon={<IconBrandGithub size={20} />}
            onClick={() => window.open('https://github.com', '_blank')}
          >
            View on GitHub
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
    </Header>
  );
}
