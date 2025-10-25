const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');

// Routes for projects
router.post('/', ProjectController.createProject); // Create a new project
router.get('/', ProjectController.getAllProjects); // Get all projects
router.get('/:id', ProjectController.getProjectById); // Get project by ID
router.put('/:id', ProjectController.updateProject); // Update a project
router.delete('/:id', ProjectController.deleteProject); // Delete a project

// Routes for CAPX
router.post('/:projectId/capx', ProjectController.createCapx); // Create CAPX
router.put('/capx/:id', ProjectController.updateCapx); // Update CAPX
router.delete('/capx/:id', ProjectController.deleteCapx); // Delete CAPX

// Routes for OPX
router.post('/:projectId/opx', ProjectController.createOpx); // Create OPX
router.put('/opx/:id', ProjectController.updateOpx); // Update OPX
router.delete('/opx/:id', ProjectController.deleteOpx); // Delete OPX

// BD-Expenditure
router.post('/:projectId/bdexp',   ProjectController.createBdexp);
router.get('/:projectId/bdexp',    ProjectController.getBdexpByProjectId);
router.delete('/bdexp/:id',        ProjectController.deleteBdexp);

module.exports = router;