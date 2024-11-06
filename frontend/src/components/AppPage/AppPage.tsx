import React, { ChangeEvent, useEffect, useState } from 'react';
import apiClient from '../../constants/apiClient';
import FileItem from '../FileItem/FileItem';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import { routeAnimation } from '../../constants/animations';
import { ROUTES } from '../../constants/routes';
import { motion } from 'framer-motion';
import styles from './AppPage.module.scss';

interface AppFile {
  _id: string;
  filename: string;
  s3Key: string;
  tags: string[];
  viewCount: number;
  uploadedAt: string;
}

interface UploadingFile {
  uniqueId: string;
  filename: string;
  progress: number;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const App: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<AppFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await apiClient.get<AppFile[]>(
        '/api/v1/files/user-files'
      );
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (isImage && file.size <= MAX_IMAGE_SIZE) {
          validFiles.push(file);
        } else if (isVideo && file.size <= MAX_VIDEO_SIZE) {
          validFiles.push(file);
        } else {
          const fileType = isImage ? 'Image' : isVideo ? 'Video' : 'File';
          const maxSize = isImage
            ? MAX_IMAGE_SIZE / (1024 * 1024)
            : MAX_VIDEO_SIZE / (1024 * 1024);
          errors.push(
            `${fileType} "${file.name}" exceeds size limit of ${maxSize} MB`
          );
        }
      }

      setErrorMessages(errors);
      if (validFiles.length > 0) {
        uploadFiles(validFiles);
      }
    }
  };

  const uploadFiles = (filesToUpload: File[]) => {
    filesToUpload.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', JSON.stringify(['example', 'tag']));

      const uniqueId = `${file.name}-${Date.now()}`;

      setUploadingFiles(prev => [
        ...prev,
        { uniqueId, filename: file.name, progress: 0 },
      ]);

      apiClient
        .post('/api/v1/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadingFiles(prev =>
                prev.map(f =>
                  f.uniqueId === uniqueId ? { ...f, progress } : f
                )
              );
            }
          },
        })
        .then(response => {
          setUploadingFiles(prev => prev.filter(f => f.uniqueId !== uniqueId));
          setFiles(prev => [
            ...prev,
            { ...response.data, filename: response.data.filename || file.name },
          ]);
        })
        .catch(error => {
          console.error(`Error uploading file ${file.name}:`, error);
          setUploadingFiles(prev => prev.filter(f => f.uniqueId !== uniqueId));
        });
    });
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await apiClient.delete(`/api/v1/files/${fileId}`);
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(ROUTES.SIGN_IN);
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <motion.div {...routeAnimation} className={styles.wrapper}>
      <h1>File Management</h1>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className={styles.fileInput}
      />

      {errorMessages.length > 0 && (
        <div className={styles.uploadError}>
          <h3>Upload Errors:</h3>
          <ul>
            {errorMessages.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <h2>Uploading Files</h2>
      <div>
        {uploadingFiles.map(file => (
          <div key={file.uniqueId} className={styles.fileItem}>
            <h3>{file.filename}</h3>
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBar}
                style={{ width: `${file.progress}%` }}
              ></div>
            </div>
            <p className={styles.progressText}>{file.progress}%</p>
          </div>
        ))}
      </div>

      <h2>Your Files</h2>
      <div>
        {files.map(file => (
          <FileItem key={file._id} file={file} onDelete={handleFileDelete} />
        ))}
      </div>
    </motion.div>
  );
};

export default App;
