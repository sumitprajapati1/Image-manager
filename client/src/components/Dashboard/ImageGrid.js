import React from 'react';

const ImageGrid = ({ images, onDeleteImage, showFolderPath = false }) => {
  // Get the base URL for images - either from env or default to localhost:5000
  const getImageUrl = (imageUrl) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const serverBaseUrl = baseUrl.replace('/api', '');
    return `${serverBaseUrl}${imageUrl}`;
  };

  if (images.length === 0) {
    return (
      <div className="no-images">
        <p>No images in this folder</p>
      </div>
    );
  }

  return (
    <div className="image-grid">
      {images.map((image) => (
        <div key={image._id} className="image-card">
          <div className="image-container">
            <img
              src={getImageUrl(image.url)}
              alt={image.name}
              className="image-thumbnail"
            />
            <div className="image-overlay">
              <button
                className="delete-image-btn"
                onClick={() => onDeleteImage(image._id)}
                title="Delete image"
              >
                🗑️
              </button>
            </div>
          </div>
          <div className="image-info">
            <h4 className="image-name">{image.name}</h4>
            {showFolderPath && image.folder && (
              <p className="folder-path">📁 {image.folder.path}</p>
            )}
            <p className="image-size">{(image.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;