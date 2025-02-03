import { useState } from 'react';
import { 
  TextInput, 
  Button, 
  Card, 
  Text, 
  Stack,
  Modal,
  Group,
  FileInput
} from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

function BulkUploadModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) return;
    console.log("Uploading file:", file.name);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Bulk Upload CSV">
      <Stack>
        <FileInput
          placeholder="Choose CSV file"
          accept=".csv"
          value={file}
          onChange={setFile}
          icon={<IconUpload size={14} />}
        />
        <Group position="right" mt="md">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpload}>Upload</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");

  const handleAnalyze = (url: string) => {
    // TODO: Implement repository analysis
    console.log("Analyzing:", url);
  };

  return (
    <Stack spacing="xl">
      <Text size="xl" weight={700}>Analyze a GitHub Repository</Text>
      
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Stack>
          <Text weight={500}>Single Repo Analysis</Text>
          
          <TextInput
            placeholder="Enter GitHub URL"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.currentTarget.value)}
          />
          
          <Button 
            onClick={() => handleAnalyze(repoUrl)}
            disabled={!repoUrl.trim()}
          >
            Analyze Repository
          </Button>
        </Stack>
      </Card>

      <Button 
        variant="light" 
        onClick={() => setShowModal(true)}
      >
        Bulk Upload (CSV)
      </Button>

      <BulkUploadModal
        opened={showModal}
        onClose={() => setShowModal(false)}
      />
    </Stack>
  );
}
