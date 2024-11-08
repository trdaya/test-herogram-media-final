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

    // @ts-ignore
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(
        () => {
          showToast(
            `Copied "${file.filename}" link to clipboard!`,
            'info',
            true,
            2000
          );
        },
        error => {
          console.error('Failed to copy link: ', error);
          showToast(
            `Failed to copy link for file ${file.filename}. Please try again.`,
            'error'
          );
        }
      );
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast(
          `Copied "${file.filename}" link to clipboard!`,
          'info',
          true,
          2000
        );
      } catch (err) {
        console.error('Fallback: Failed to copy link: ', err);
        showToast(
          `Failed to copy link for file ${file.filename}. Please try again.`,
          'error'
        );
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.fileName} title={file.filename}>
        {file.filename}
      </div>
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
