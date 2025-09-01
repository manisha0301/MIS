import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      // ✅ Save token in sessionStorage
      sessionStorage.setItem("token", data.token);

      // ✅ Save user info if you want (optional)
      sessionStorage.setItem("user", JSON.stringify(data.user));

      onLogin();  // mark as logged in
      navigate("/");  // redirect to dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="Logo" />
        </div>
        <h1>Login to MIS</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="action-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;