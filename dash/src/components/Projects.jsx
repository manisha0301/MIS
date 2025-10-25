import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const user = JSON.parse(sessionStorage.getItem('user'))

  useEffect(() => {
  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects');
      const data = await response.json();
      // console.log("data:", data)
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  fetchProjects();
}, []);

  return (
    <div className="dashboard" style={{
      padding: '10px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center'
        }}>Ongoing Projects</h1>
        {user && user.role === 'Admin' && (
        <Link
          to="/projects/add"
          style={{
            padding: '10px 24px',
            backgroundColor: '#0a9396',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
            letterSpacing: '0.2px',
            textDecoration: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#005f73';
            e.currentTarget.style.transform = 'scale(1.04)';
            e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.12)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0a9396';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
          }}
        >
          Add Project
        </Link>
        )}
      </div>
      <div className="project-grid" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        padding: '32px',
        borderRadius: '16px',
        margin: '0 auto',
        maxWidth: '1200px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px'
      }}>
        {projects.length > 0 ? (
          projects.map(project => (
            <div
              // to={`/projects/${project.id}`}
              key={project.id}
              className="project-card"
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease',
                textDecoration: 'none',
                color: 'inherit',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.border = '1px solid #0a9396';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.border = '1px solid #e2e8f0';
              }}
            >
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '16px',
                position: 'relative',
                paddingTop: '56.25%',
                backgroundColor: '#f0f4f8'
              }}>
                <img
                  // src={project.image}
                  src={`http://localhost:5000${project.image}`}
                  alt={project.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>
              <h3 style={{
                color: '#1e293b',
                fontSize: '22px',
                fontWeight: '600',
                margin: '12px 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>{project.name}</h3>
              <div style={{
                backgroundColor: '#f0f4f8',
                padding: '12px',
                borderRadius: '8px',
                margin: '12px 0'
              }}>
                <p style={{
                  color: '#0a9396',
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: 0
                }}>Lead: {project.lead}</p>
              </div>
              {/* <div style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                minHeight: '80px',
                backgroundColor: '#fff'
              }}>
                <p style={{
                  color: '#64748b',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0,
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                }}>{project.description.substring(0, 80)}...</p>
              </div> */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                flexDirection:'row', 
                gap:'10px' 
                }}
              >
              <button
                style={{
                  marginTop: '16px',
                  padding: '10px 10px',
                  backgroundColor: '#0a9396',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#005f73';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#0a9396';
                }}
                onClick={() => navigate(`/projects/bdexpenditure/${project.id}`)}
              >
                BD Expenditure
              </button>

              <button
                style={{
                  marginTop: '16px',
                  padding: '10px 10px',
                  backgroundColor: '#0a9396',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#005f73';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#0a9396';
                }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                Execution Expenditure
              </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            gridColumn: 'span 3',
            textAlign: 'center'
          }}>No projects available.</p>
        )}
      </div>
    </div>
  );
}

export default Projects;