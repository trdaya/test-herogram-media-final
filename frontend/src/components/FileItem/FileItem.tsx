import React from 'react';
import { BsEye } from 'react-icons/bs';
import { FiLink } from 'react-icons/fi';
import { IoTrashOutline } from 'react-icons/io5';
import { showToast } from '../ToastManager/ToastManager';
import styles from './FileItem.module.scss';

interface AppFile {
  _id: string;
  filename: string;
  s3Key: string;
  tags: string[];
  viewCount: number;
  uploadedAt: string;
}

interface FileItemProps {
  file: AppFile;
  onDelete: (fileId: string, fileName: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onDelete }) => {
  const copyToClipboard = (fileId: string) => {
    const link = `${import.meta.env.VITE_API_URL}/api/v1/files/public/${fileId}`;

    navigator.clipboard.writeText(link).then(
      () => {
        showToast(
          `Copied "${file.filename}" link to clipboard!`,
          'info',
          undefined,
          2000
        );
      },
      error => {
        console.error('Failed to copy link: ', error);
      }
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.fileName}>{file.filename}</div>
      <FiLink
        size={20}
        onClick={() => copyToClipboard(file._id)}
        title="Copy link"
        cursor={'pointer'}
      />
      <span className={styles.viewsWrapper} title="Views">
        <BsEye size={20} />
        {file.viewCount || 0}
      </span>
      <IoTrashOutline
        size={20}
        onClick={() => onDelete(file._id, file.filename)}
        title="Delete"
        cursor={'pointer'}
      />
    </div>
  );
};

export default FileItem;
