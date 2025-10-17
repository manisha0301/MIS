const ProjectModel = require('../models/projectModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/project');
    // Ensure the project directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PNG, JPEG, or WebP images are allowed!'));
    }
  }
}).single('image');

const ProjectController = {
  createProject: async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      try {
        const {
          name, description, lead, team, startDate, endDate,
          timelineCompleted, timelineInProgress, timelineRemaining,
          company, revenue
        } = req.body;

        // Validate timeline percentages
        const totalTimeline = parseFloat(timelineCompleted) + parseFloat(timelineInProgress) + parseFloat(timelineRemaining);
        if (totalTimeline !== 100) {
          return res.status(400).json({ message: 'Timeline percentages must sum to 100%.' });
        }

        // Validate required fields
        if (!name || !lead || !startDate || !endDate || !company || !req.file) {
          return res.status(400).json({ message: 'Please fill in all required fields, including an image and company.' });
        }

        const project = {
          name,
          description,
          lead,
          team: team.split(',').map(t => t.trim()),
          startDate,
          endDate,
          timelineCompleted: parseFloat(timelineCompleted),
          timelineInProgress: parseFloat(timelineInProgress),
          timelineRemaining: parseFloat(timelineRemaining),
          image: `/uploads/project/${req.file.filename}`,
          company,
          revenue: parseFloat(revenue) || 0
        };

        const newProject = await ProjectModel.createProject(project);
        res.status(201).json({ message: 'Project created successfully!', project: newProject });
      } catch (error) {
        res.status(500).json({ message: 'Error creating project', error: error.message });
      }
    });
  },

  getAllProjects: async (req, res) => {
    try {
      const projects = await ProjectModel.getAllProjects();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
  },

  getProjectById: async (req, res) => {
    try {
      const project = await ProjectModel.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching project', error: error.message });
    }
  },

  updateProject: async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      try {
        const {
          name, description, lead, team, startDate, endDate,
          timelineCompleted, timelineInProgress, timelineRemaining,
          company, revenue
        } = req.body;

        // Validate timeline percentages
        const totalTimeline = parseFloat(timelineCompleted) + parseFloat(timelineInProgress) + parseFloat(timelineRemaining);
        if (totalTimeline !== 100) {
          return res.status(400).json({ message: 'Timeline percentages must sum to 100%.' });
        }

        // Validate required fields
        if (!name || !lead || !startDate || !endDate || !company) {
          return res.status(400).json({ message: 'Please fill in all required fields, including an image and company.' });
        }

        const project = {
          name,
          description,
          lead,
          team: team.split(',').map(t => t.trim()),
          startDate,
          endDate,
          timelineCompleted: parseFloat(timelineCompleted),
          timelineInProgress: parseFloat(timelineInProgress),
          timelineRemaining: parseFloat(timelineRemaining),
          image: req.file ? `/uploads/project/${req.file.filename}` : req.body.image,
          company,
          revenue: parseFloat(revenue) || 0
        };

        const updatedProject = await ProjectModel.updateProject(req.params.id, project);
        if (!updatedProject) {
          return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({ message: 'Project updated successfully!', project: updatedProject });
      } catch (error) {
        res.status(500).json({ message: 'Error updating project', error: error.message });
      }
    });
  },

  deleteProject: async (req, res) => {
    try {
      const deletedProject = await ProjectModel.deleteProject(req.params.id);
      if (!deletedProject) {
        return res.status(404).json({ message: 'Project not found' });
      }
      // Optionally, delete the image file from the server
      if (deletedProject.image) {
        const imagePath = path.join(__dirname, '../', deletedProject.image);
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error deleting image file:', err);
        });
      }
      res.status(200).json({ message: 'Project deleted successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
  }
};

module.exports = ProjectController;