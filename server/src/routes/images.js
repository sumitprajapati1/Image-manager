import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Image from '../models/Image.js';
import Folder from '../models/Folder.js';
import auth from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();



// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Get images by folder
router.get('/folder/:folderId', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.folderId,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const images = await Image.find({
      folder: req.params.folderId,
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search images
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json([]);
    }

    const images = await Image.find({
      owner: req.user._id,
      name: { $regex: query, $options: 'i' },
    })
      .populate('folder', 'name path')
      .sort({ createdAt: -1 });

    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, folderId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Verify folder ownership
    const folder = await Folder.findOne({
      _id: folderId,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const image = new Image({
      name: name || req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder: folderId,
      owner: req.user._id,
      url: `/uploads/${req.file.filename}`,
    });

    await image.save();
    await image.populate('folder', 'name path');

    res.status(201).json(image);
  } catch (error) {
    // Delete uploaded file if database save fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete image
router.delete('/:id', auth, async (req, res) => {
  
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });


    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', '..', 'uploads', image.filename);

    
    // Use asynchronous file deletion with proper error handling
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } 
      });
    } 

    // Delete from database
    await Image.findByIdAndDelete(req.params.id);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;