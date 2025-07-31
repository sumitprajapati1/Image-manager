import React, { useMemo } from 'react';

const FolderTree = ({ folders, selectedFolder, onSelectFolder, onDeleteFolder }) => {
  const folderTree = useMemo(() => {
    const tree = [];
    const folderMap = {};

    // Create a map of all folders
    folders.forEach(folder => {
      folderMap[folder._id] = {
        ...folder,
        children: []
      };
    });

    // Build the tree structure
    folders.forEach(folder => {
      if (folder.parent) {
        if (folderMap[folder.parent._id]) {
          folderMap[folder.parent._id].children.push(folderMap[folder._id]);
        }
      } else {
        tree.push(folderMap[folder._id]);
      }
    });

    return tree;
  }, [folders]);

  const renderFolder = (folder, level = 0) => {
    const isSelected = selectedFolder && selectedFolder._id === folder._id;
    
    return (
      <div key={folder._id} className="folder-item">
        <div
          className={`folder-content ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 20}px` }}
        >
          <div
            className="folder-name"
            onClick={() => onSelectFolder(folder)}
          >
            📁 {folder.name}
          </div>
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder(folder._id);
            }}
            title="Delete folder"
          >
            🗑️
          </button>
        </div>
        {folder.children && folder.children.length > 0 && (
          <div className="folder-children">
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="folder-tree">
      {folderTree.length === 0 ? (
        <p className="no-folders">No folders yet</p>
      ) : (
        folderTree.map(folder => renderFolder(folder))
      )}
    </div>
  );
};

export default FolderTree;