import { v2 as cloudinary } from 'cloudinary';
import Resource from '../../models/Resource.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// POST /api/admin/resources
export const createResource = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    console.log('Uploading file:', { type, mimetype: file.mimetype, size: file.size });

    // Upload to Cloudinary from buffer with auto resource type
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'resources',
          public_id: `${type}_${Date.now()}`,
          flags: type === 'pdf' ? 'attachment' : undefined
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      ).end(file.buffer);
    });

    // Generate proper URLs for different file types
    let thumbnailUrl = result.secure_url;
    
    if (type === 'pdf') {
      // Generate PDF thumbnail using Cloudinary transformation
      thumbnailUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_jpg,q_auto,w_300,h_400,c_fit/${result.public_id}.jpg`;
    }

    const resource = new Resource({
      title,
      description,
      type,
      url: result.secure_url,
      thumbnailUrl: thumbnailUrl,
      previewUrl: result.secure_url,
      cloudinaryPublicId: result.public_id
    });

    await resource.save();
    console.log('Resource saved:', resource._id);
    res.status(201).json(resource);
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/resources
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/resources/:id
export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/admin/resources/:id
export const updateResource = async (req, res) => {
  try {
    const { title, description, type, isActive } = req.body;
    const file = req.file;

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (type) resource.type = type;
    if (isActive !== undefined) resource.isActive = isActive;

    // Upload new file if provided
    if (file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'resources',
            public_id: `${resource.type}_${Date.now()}`,
            flags: resource.type === 'pdf' ? 'attachment' : undefined
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
      
      resource.url = result.secure_url;
      resource.cloudinaryPublicId = result.public_id;
      
      if (resource.type === 'pdf') {
        resource.thumbnailUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_jpg,q_auto,w_300,h_400,c_fit/${result.public_id}.jpg`;
      } else {
        resource.thumbnailUrl = result.secure_url;
      }
    }

    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/admin/resources/:id
export const deleteResource = async (req, res) => {
  try {
    console.log('Deleting resource with ID:', req.params.id);
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};