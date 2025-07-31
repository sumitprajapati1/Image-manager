import express from 'express';
import Folder from '../models/Folder.js';
import Image from '../models/Image.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all folders for user
router.get('/', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id })
      .populate('parent', 'name')
      .sort({ path: 1 });
    res.json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create folder
router.post('/', auth, async (req, res) => {
  try {
    const { name, parent } = req.body;

    let path = name;
    if (parent) {
      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user._id,
      });
      
      if (!parentFolder) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
      
      path = `${parentFolder.path}/${name}`;
    }

    const folder = new Folder({
      name,
      parent: parent || null,
      owner: req.user._id,
      path,
    });

    await folder.save();
    await folder.populate('parent', 'name');
    
    res.status(201).json(folder);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Folder with this name already exists in this location' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete folder
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if folder has subfolders or images
    const subfolders = await Folder.find({ parent: folder._id });
    const images = await Image.find({ folder: folder._id });

    if (subfolders.length > 0 || images.length > 0) {
      return res.status(400).json({ message: 'Cannot delete folder with contents' });
    }

    await Folder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;