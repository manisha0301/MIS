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

const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/receipt');
    fs.mkdirSync(uploadPath, { recursive: true });   // <-- create if missing
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const { projectId, area } = req.body;
    const safeArea = (area || 'unknown').replace(/[^a-z0-9]/gi, '_');
    const filename = `${projectId}-${safeArea}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

const uploadReceipt = multer({
  storage: receiptStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are allowed!'));
  }
}).single('receiptProof');   // <-- name used in the form

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
  },

  // Create CAPX
  createCapx: async (req, res) => {
    try {
      const { projectId, item = '', amount = 0, date = null, description = '' } = req.body;
      if (!projectId) {
        return res.status(400).json({ message: 'Please provide projectId.' });
      }
      const capx = {
        item,
        amount: parseFloat(amount),
        date: date || null, // Allow null date for initial creation
        description
      };
      const newCapx = await ProjectModel.createCapx(projectId, capx);
      res.status(201).json({ message: 'CAPX created successfully!', capx: newCapx });
    } catch (error) {
      res.status(500).json({ message: 'Error creating CAPX', error: error.message });
    }
  },

  // Create OPX
  createOpx: async (req, res) => {
    try {
      const { projectId, item = '', amount = 0, date = null, description = '' } = req.body;
      if (!projectId) {
        return res.status(400).json({ message: 'Please provide projectId.' });
      }
      const opx = {
        item,
        amount: parseFloat(amount),
        date: date || null, // Allow null date for initial creation
        description
      };
      const newOpx = await ProjectModel.createOpx(projectId, opx);
      res.status(201).json({ message: 'OPX created successfully!', opx: newOpx });
    } catch (error) {
      res.status(500).json({ message: 'Error creating OPX', error: error.message });
    }
  },

  // Update CAPX
  updateCapx: async (req, res) => {
    try {
      const { id } = req.params;
      const { item, amount, date, description } = req.body;
      if (!item || !amount || !date) {
        return res.status(400).json({ message: 'Please provide all required fields: item, amount, date.' });
      }
      const capx = {
        item,
        amount: parseFloat(amount),
        date,
        description
      };
      const updatedCapx = await ProjectModel.updateCapx(id, capx);
      if (!updatedCapx) {
        return res.status(404).json({ message: 'CAPX not found' });
      }
      res.status(200).json({ message: 'CAPX updated successfully!', capx: updatedCapx });
    } catch (error) {
      res.status(500).json({ message: 'Error updating CAPX', error: error.message });
    }
  },

  // Update OPX
  updateOpx: async (req, res) => {
    try {
      const { id } = req.params;
      const { item, amount, date, description } = req.body;
      if (!item || !amount || !date) {
        return res.status(400).json({ message: 'Please provide all required fields: item, amount, date.' });
      }
      const opx = {
        item,
        amount: parseFloat(amount),
        date,
        description
      };
      const updatedOpx = await ProjectModel.updateOpx(id, opx);
      if (!updatedOpx) {
        return res.status(404).json({ message: 'OPX not found' });
      }
      res.status(200).json({ message: 'OPX updated successfully!', opx: updatedOpx });
    } catch (error) {
      res.status(500).json({ message: 'Error updating OPX', error: error.message });
    }
  },

  // Delete CAPX
  deleteCapx: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCapx = await ProjectModel.deleteCapx(id);
      if (!deletedCapx) {
        return res.status(404).json({ message: 'CAPX not found' });
      }
      res.status(200).json({ message: 'CAPX deleted successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting CAPX', error: error.message });
    }
  },

  // Delete OPX
  deleteOpx: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedOpx = await ProjectModel.deleteOpx(id);
      if (!deletedOpx) {
        return res.status(404).json({ message: 'OPX not found' });
      }
      res.status(200).json({ message: 'OPX deleted successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting OPX', error: error.message });
    }
  },

  createBdexp: async (req, res) => {
    uploadReceipt(req, res, async (err) => {
      if (err) return res.status(400).json({ message: err.message });

      try {
        const { projectId, area, date, amount } = req.body;
        if (!projectId || !area || !date || !amount || !req.file) {
          return res.status(400).json({ message: 'All fields + PDF are required' });
        }

        const receiptPath = `/uploads/receipt/${req.file.filename}`;

        const newBdexp = await ProjectModel.createBdexp(
          projectId,
          { area, date, amount: parseFloat(amount) },
          receiptPath
        );

        res.status(201).json({ message: 'BD-Expenditure added', bdexp: newBdexp });
      } catch (e) {
        res.status(500).json({ message: 'Server error', error: e.message });
      }
    });
  },

  // ---- GET ALL FOR A PROJECT ------------------------------------
  getBdexpByProjectId: async (req, res) => {
    try {
      const { projectId } = req.params;
      const list = await ProjectModel.getBdexpByProjectId(projectId);
      res.json(list);
    } catch (e) {
      res.status(500).json({ message: 'Server error', error: e.message });
    }
  },

  // ---- DELETE ---------------------------------------------------
  deleteBdexp: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await ProjectModel.deleteBdexp(id);

      if (!deleted) return res.status(404).json({ message: 'Not found' });

      // remove the PDF file
      const filePath = path.join(__dirname, '..', deleted.receipt);
      fs.unlink(filePath, (err) => { if (err) console.error(err); });

      res.json({ message: 'BD-Expenditure removed' });
    } catch (e) {
      res.status(500).json({ message: 'Server error', error: e.message });
    }
  }
};

module.exports = ProjectController;