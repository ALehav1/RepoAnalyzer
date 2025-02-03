import { useState } from 'react';
import { Modal, Button, Group, Text, FileInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { repositoryApi } from '../api/client';

interface BulkUploadModalProps {
  opened: boolean;
  onClose: () => void;
}

export function BulkUploadModal({ opened, onClose }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      notifications.show({
        title: 'Error',
        message: 'Please select a CSV file',
        color: 'red',
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await repositoryApi.bulkUpload(formData);
      
      notifications.show({
        title: 'Success',
        message: 'Repositories uploaded successfully',
        color: 'green',
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload repositories',
        color: 'red',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Bulk Upload Repositories"
      size="md"
    >
      <Text size="sm" mb="md">
        Upload a CSV file containing GitHub repository URLs. Each URL should be on a new line.
      </Text>

      <FileInput
        accept=".csv"
        placeholder="Choose CSV file"
        value={file}
        onChange={setFile}
        mb="md"
      />

      <Group justify="flex-end">
        <Button variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          loading={isUploading}
        >
          Upload
        </Button>
      </Group>
    </Modal>
  );
}
