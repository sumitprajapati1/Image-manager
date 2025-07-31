import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../utils/api';
import FolderTree from './FolderTree';
import ImageGrid from './ImageGrid';
import SearchBar from './SearchBar';
import Modal from '../Common/Modal';

const Dashboard = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [images, setImages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await api.get('/folders');
      setFolders(response);
      if (response.length > 0 && !selectedFolder) {
        setSelectedFolder(response[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async (folderId) => {
    try {
      const response = await api.get(`/images/folder/${folderId}`);
      setImages(response);
    } catch (error) {
      toast.error('Failed to fetch images');
    }
  };

  useEffect(() => {
    if (selectedFolder && !isSearchMode) {
      fetchImages(selectedFolder._id);
    }
  }, [selectedFolder, isSearchMode]);

  const handleSearch = useCallback(async (query) => {
    if (query.trim() === '') {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.get(`/images/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response);
      setIsSearchMode(true);
    } catch (error) {
      toast.error('Search failed');
    }
  }, []);

  const handleCreateFolder = async (folderData) => {
    try {
      await api.post('/folders', folderData);
      await fetchFolders();
      setShowCreateFolder(false);
      toast.success('Folder created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create folder');
    }
  };

  const handleUploadImage = async (imageData) => {
    try {
      const formData = new FormData();
      formData.append('name', imageData.name);
      formData.append('image', imageData.file);
      formData.append('folderId', selectedFolder._id);

      await api.upload('/images/upload', formData);

      if (!isSearchMode) {
        await fetchImages(selectedFolder._id);
      }
      setShowUploadImage(false);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await api.delete(`/images/${imageId}`);
        if (isSearchMode) {
          setSearchResults(searchResults.filter(img => img._id !== imageId));
        } else {
          setImages(images.filter(img => img._id !== imageId));
        }
        toast.success('Image deleted successfully');
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      try {
        await api.delete(`/folders/${folderId}`);
        await fetchFolders();
        if (selectedFolder && selectedFolder._id === folderId) {
          setSelectedFolder(folders[0] || null);
        }
        toast.success('Folder deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete folder');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <SearchBar onSearch={handleSearch} />
        <div className="action-buttons">
          <button
            className="btn-primary"
            onClick={() => setShowCreateFolder(true)}
          >
            Create Folder
          </button>
          {selectedFolder && (
            <button
              className="btn-primary"
              onClick={() => setShowUploadImage(true)}
            >
              Upload Image
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sidebar">
          <h3>Folders</h3>
          <FolderTree
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>

        <div className="main-content">
          {isSearchMode ? (
            <div>
              <h3>Search Results</h3>
              <ImageGrid
                images={searchResults}
                onDeleteImage={handleDeleteImage}
                showFolderPath={true}
              />
            </div>
          ) : (
            <div>
              {selectedFolder ? (
                <div>
                  <h3>{selectedFolder.name}</h3>
                  <ImageGrid
                    images={images}
                    onDeleteImage={handleDeleteImage}
                  />
                </div>
              ) : (
                <div className="no-folder">
                  <p>No folders available. Create your first folder to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        title="Create New Folder"
      >
        <CreateFolderForm
          folders={folders}
          onSubmit={handleCreateFolder}
          onCancel={() => setShowCreateFolder(false)}
        />
      </Modal>

      <Modal
        isOpen={showUploadImage}
        onClose={() => setShowUploadImage(false)}
        title="Upload Image"
      >
        <UploadImageForm
          onSubmit={handleUploadImage}
          onCancel={() => setShowUploadImage(false)}
        />
      </Modal>
    </div>
  );
};

const CreateFolderForm = ({ folders, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      parent: formData.parent || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="folderName">Folder Name</label>
        <input
          type="text"
          id="folderName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="parentFolder">Parent Folder (Optional)</label>
        <select
          id="parentFolder"
          value={formData.parent}
          onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
        >
          <option value="">-- Root Level --</option>
          {folders.map((folder) => (
            <option key={folder._id} value={folder._id}>
              {folder.path}
            </option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Create
        </button>
      </div>
    </form>
  );
};

const UploadImageForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    file: null,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      file,
      name: formData.name || (file ? file.name : ''),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select an image file');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="imageName">Image Name</label>
        <input
          type="text"
          id="imageName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="imageFile">Select Image</label>
        <input
          type="file"
          id="imageFile"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Upload
        </button>
      </div>
    </form>
  );
};

export default Dashboard;