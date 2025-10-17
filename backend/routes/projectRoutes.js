const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');

// Routes for projects
router.post('/', ProjectController.createProject); // Create a new project
router.get('/', ProjectController.getAllProjects); // Get all projects
router.get('/:id', ProjectController.getProjectById); // Get project by ID
router.put('/:id', ProjectController.updateProject); // Update a project
router.delete('/:id', ProjectController.deleteProject); // Delete a project

module.exports = router;