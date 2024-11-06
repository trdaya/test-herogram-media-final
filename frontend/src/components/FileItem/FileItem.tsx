import React from 'react';

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
  onDelete: (fileId: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onDelete }) => {
  return (
    <div
      style={{
        marginBottom: '10px',
        padding: '10px',
        border: '1px solid #ccc',
      }}
    >
      <h3>{file.filename}</h3>
      <p>Views: {file.viewCount}</p>
      <button onClick={() => onDelete(file._id)}>Delete</button>
    </div>
  );
};

export default FileItem;
