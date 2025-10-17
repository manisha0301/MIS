const pool = require('../config/db');

const ProjectModel = {
  // Create projects table
  createProjectsTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        lead VARCHAR(100) NOT NULL,
        team TEXT[],  -- Array of team members
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        timeline_completed FLOAT DEFAULT 0,
        timeline_in_progress FLOAT DEFAULT 0,
        timeline_remaining FLOAT DEFAULT 0,
        image VARCHAR(255) NOT NULL,
        company VARCHAR(100) NOT NULL,
        revenue FLOAT DEFAULT 0
      );
    `;
    try {
      await pool.query(query);
      console.log('Projects table created or already exists');
    } catch (error) {
      console.error('Error creating projects table:', error);
      throw error;
    }
  },

  // Create a new project
  createProject: async (project) => {
    const {
      name, description, lead, team, startDate, endDate,
      timelineCompleted, timelineInProgress, timelineRemaining,
      image, company, revenue
    } = project;
    const query = `
      INSERT INTO projects (
        name, description, lead, team, start_date, end_date,
        timeline_completed, timeline_in_progress, timeline_remaining,
        image, company, revenue
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [
        name, description, lead, team, startDate, endDate,
        timelineCompleted, timelineInProgress, timelineRemaining,
        image, company, revenue
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Get all projects
  getAllProjects: async () => {
    const query = 'SELECT * FROM projects;';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get project by ID
  getProjectById: async (id) => {
    const query = 'SELECT * FROM projects WHERE id = $1;';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  },

  // Update a project
  updateProject: async (id, project) => {
    const {
      name, description, lead, team, startDate, endDate,
      timelineCompleted, timelineInProgress, timelineRemaining,
      image, company, revenue
    } = project;
    const query = `
      UPDATE projects
      SET name = $1, description = $2, lead = $3, team = $4,
          start_date = $5, end_date = $6,
          timeline_completed = $7, timeline_in_progress = $8, timeline_remaining = $9,
          image = $10, company = $11, revenue = $12
      WHERE id = $13
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [
        name, description, lead, team, startDate, endDate,
        timelineCompleted, timelineInProgress, timelineRemaining,
        image, company, revenue, id
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (id) => {
    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *;';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};

module.exports = ProjectModel;