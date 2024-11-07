import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import apiClient from '../../constants/apiClient';
import FileItem from '../FileItem/FileItem';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import { routeAnimation } from '../../constants/animations';
import { ROUTES } from '../../constants/routes';
import { motion } from 'framer-motion';
import styles from './AppPage.module.scss';
import { showToast } from '../ToastManager/ToastManager';
import { TbRefresh } from 'react-icons/tb';
import { HashLoader } from 'react-spinners';

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState<boolean>(false);

  const fetchFiles = async () => {
    try {
      setFetchingFiles(true);
      const response = await apiClient.get<AppFile[]>(
        '/api/v1/files/user-files'
      );
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      showToast(
        'Error fetching files. Please reload the page and try again.',
        'error'
      );
    } finally {
      setFetchingFiles(false);
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
          setFiles(prev =>
            prev
              .concat(response.data.file)
              .sort(
                (a: any, b: any) =>
                  new Date(b.uploadedAt).getTime() -
                  new Date(a.uploadedAt).getTime()
              )
          );
        })
        .catch(error => {
          console.error(`Error uploading file ${file.name}:`, error);
          showToast(`Error uploading file "${file.name}"`, 'error');
        })
        .finally(() => {
          setUploadingFiles(prev => prev.filter(f => f.uniqueId !== uniqueId));
          if (fileInputRef.current) fileInputRef.current.value = '';
        });
    });
  };

  const handleFileDelete = async (fileId: string, fileName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the file "${fileName}"?`
    );

    if (confirmDelete) {
      try {
        await apiClient.delete(`/api/v1/files/${fileId}`);
        setFiles(prevFiles => prevFiles.filter(file => file._id !== fileId));
        showToast(`File "${fileName}" deleted successfully`, 'success');
      } catch (error) {
        console.error('Error deleting file:', error);
        showToast(
          `Error deleting file "${fileName}". Please try again`,
          'error'
        );
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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
      <h1 className={styles.mainTitle}>File Management</h1>
      <input
        ref={fileInputRef}
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

      <h2 className={styles.subTitle}>
        Your Files &nbsp;&nbsp;
        <TbRefresh
          size={20}
          title="Re-fetch files"
          onClick={fetchFiles}
          cursor={'pointer'}
        />
      </h2>

      <div>
        {fetchingFiles ? (
          <HashLoader color="#5a40dc" size={60} className={styles.loader} />
        ) : !uploadingFiles.length && !files.length ? (
          <h3 className={styles.noFilesFound}>
            You do not have any files. Upload some using the button above!{' '}
          </h3>
        ) : (
          <>
            {uploadingFiles.map(file => (
              <div key={file.uniqueId} className={styles.fileItem}>
                <div className={styles.fileName} title={file.filename}>
                  {file.filename}
                </div>
                <div className={styles.progressBarContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
                <p className={styles.progressText}>{file.progress}%</p>
              </div>
            ))}
            {files.map(file => (
              <FileItem
                key={file._id}
                file={file}
                onDelete={handleFileDelete}
              />
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default App;
