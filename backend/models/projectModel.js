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

  // Create CAPX table
  createCapxTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS capx (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        item VARCHAR(255) NOT NULL DEFAULT '',
        amount FLOAT NOT NULL DEFAULT 0,
        date DATE,
        description TEXT
      );
    `;
    try {
      await pool.query(query);
      console.log('CAPX table created or already exists');
    } catch (error) {
      console.error('Error creating CAPX table:', error);
      throw error;
    }
  },

  // Create OPX table
  createOpxTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS opx (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        item VARCHAR(255) NOT NULL DEFAULT '',
        amount FLOAT NOT NULL DEFAULT 0,
        date DATE,
        description TEXT
      );
    `;
    try {
      await pool.query(query);
      console.log('OPX table created or already exists');
    } catch (error) {
      console.error('Error creating OPX table:', error);
      throw error;
    }
  },

  createBdexpTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS bdexp (
        id          SERIAL PRIMARY KEY,
        project_id  INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        area        VARCHAR(100) NOT NULL,
        date        DATE NOT NULL,
        amount      FLOAT NOT NULL,
        receipt     VARCHAR(255) NOT NULL   -- path inside /uploads/receipt
      );
    `;
    try {
      await pool.query(query);
      console.log('BD-EXP table created or already exists');
    } catch (error) {
      console.error('Error creating BD-EXP table:', error);
      throw error;
    }
  },

  // CREATE
  createBdexp: async (projectId, bdexp, receiptPath) => {
    const { area, date, amount } = bdexp;
    const q = `
      INSERT INTO bdexp (project_id, area, date, amount, receipt)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const res = await pool.query(q, [projectId, area, date, amount, receiptPath]);
    return res.rows[0];
  },

  // READ – all for a project
  getBdexpByProjectId: async (projectId) => {
    const q = 'SELECT * FROM bdexp WHERE project_id = $1 ORDER BY date DESC;';
    const res = await pool.query(q, [projectId]);
    return res.rows;
  },

  // UPDATE (not required for the UI you showed, but nice to have)
  updateBdexp: async (id, bdexp, receiptPath) => {
    const { area, date, amount } = bdexp;
    const q = `
      UPDATE bdexp
      SET area = $1, date = $2, amount = $3, receipt = $4
      WHERE id = $5
      RETURNING *;
    `;
    const res = await pool.query(q, [area, date, amount, receiptPath, id]);
    return res.rows[0];
  },

  // DELETE
  deleteBdexp: async (id) => {
    const q = 'DELETE FROM bdexp WHERE id = $1 RETURNING *;';
    const res = await pool.query(q, [id]);
    return res.rows[0];
  },

  // Create a new project (unchanged)
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

  // Get project by ID with CAPX and OPX
  getProjectById: async (id) => {
    const projectQuery = 'SELECT * FROM projects WHERE id = $1;';
    const capxQuery = 'SELECT * FROM capx WHERE project_id = $1;';
    const opxQuery = 'SELECT * FROM opx WHERE project_id = $1;';
    try {
      const projectResult = await pool.query(projectQuery, [id]);
      const capxResult = await pool.query(capxQuery, [id]);
      const opxResult = await pool.query(opxQuery, [id]);
      const project = projectResult.rows[0];
      if (!project) return null;
      return {
        ...project,
        capx: capxResult.rows,
        opx: opxResult.rows
      };
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

  // Delete a project (unchanged, CASCADE will handle CAPX/OPX deletion)
  deleteProject: async (id) => {
    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *;';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Create a CAPX entry
  createCapx: async (projectId, capx) => {
    const { item, amount, date, description } = capx;
    const query = `
      INSERT INTO capx (project_id, item, amount, date, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [projectId, item, amount, date || null, description]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating CAPX:', error);
      throw error;
    }
  },

  // Create an OPX entry
  createOpx: async (projectId, opx) => {
    const { item, amount, date, description } = opx;
    const query = `
      INSERT INTO opx (project_id, item, amount, date, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [projectId, item, amount, date || null, description]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating OPX:', error);
      throw error;
    }
  },

  // Update a CAPX entry
  updateCapx: async (id, capx) => {
    const { item, amount, date, description } = capx;
    const query = `
      UPDATE capx
      SET item = $1, amount = $2, date = $3, description = $4
      WHERE id = $5
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [item, amount, date, description, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating CAPX:', error);
      throw error;
    }
  },

  // Update an OPX entry
  updateOpx: async (id, opx) => {
    const { item, amount, date, description } = opx;
    const query = `
      UPDATE opx
      SET item = $1, amount = $2, date = $3, description = $4
      WHERE id = $5
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [item, amount, date, description, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating OPX:', error);
      throw error;
    }
  },

  // Delete a CAPX entry
  deleteCapx: async (id) => {
    const query = 'DELETE FROM capx WHERE id = $1 RETURNING *;';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting CAPX:', error);
      throw error;
    }
  },

  // Delete an OPX entry
  deleteOpx: async (id) => {
    const query = 'DELETE FROM opx WHERE id = $1 RETURNING *;';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting OPX:', error);
      throw error;
    }
  }
};

module.exports = ProjectModel;