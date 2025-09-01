const pool = require("../config/db");

async function createUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'User',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function findUserByUsername(username) {
  const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
  return result.rows[0];
}

async function createUser({ name, username, password, role }) {
  const result = await pool.query(
    "INSERT INTO users (name, username, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
    [name, username, password, role]
  );
  return result.rows[0];
}

async function getAllUsers() {
  const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
  return result.rows;
}

async function deleteUsers(ids) {
  await pool.query("DELETE FROM users WHERE id = ANY($1)", [ids]);
}

module.exports = {
  createUsersTable,
  findUserByUsername,
  createUser,
  getAllUsers,
  deleteUsers,
};
