import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lead: '',
    team: [],
    startDate: '',
    endDate: '',
    timeline: { completed: 0, inProgress: 0, remaining: 0 },
    image: '',
    company: '',
    revenue: 0
  });
  const [previewImage, setPreviewImage] = useState('');
  const [notification, setNotification] = useState({ message: '', visible: false });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'team') {
      setFormData({ ...formData, team: value.split(',').map(t => t.trim()) });
    } else if (name.includes('timeline')) {
      const key = name.split('.')[1];
      setFormData({
        ...formData,
        timeline: { ...formData.timeline, [key]: parseFloat(value) || 0 }
      });
    } else if (name === 'revenue') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalTimeline = formData.timeline.completed + formData.timeline.inProgress + formData.timeline.remaining;
    if (totalTimeline !== 100) {
      setNotification({ message: 'Timeline percentages must sum to 100%.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      return;
    }
    if (!formData.name || !formData.lead || !formData.startDate || !formData.endDate || !formData.image || !formData.company) {
      setNotification({ message: 'Please fill in all required fields, including an image and company.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('lead', formData.lead);
    formDataToSend.append('team', formData.team.join(','));
    formDataToSend.append('startDate', formData.startDate);
    formDataToSend.append('endDate', formData.endDate);
    formDataToSend.append('timelineCompleted', formData.timeline.completed);
    formDataToSend.append('timelineInProgress', formData.timeline.inProgress);
    formDataToSend.append('timelineRemaining', formData.timeline.remaining);
    formDataToSend.append('company', formData.company);
    formDataToSend.append('revenue', formData.revenue);
    if (formData.image instanceof File) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        body: formDataToSend
      });
      const result = await response.json();
      if (response.ok) {
        setNotification({ message: result.message, visible: true });
        setTimeout(() => {
          setNotification({ ...notification, visible: false });
          navigate('/projects');
        }, 2000);
      } else {
        setNotification({ message: result.message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } catch (error) {
      setNotification({ message: 'Error creating project', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  // Update handleImageChange to store the File object
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: file }); // Store File object
      setPreviewImage(imageUrl);
    } else {
      setNotification({ message: 'Please upload a valid image (PNG, JPEG, or WebP).', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  return (
    <div className="dashboard" style={{
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {notification.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#0a9396',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {notification.message}
        </div>
      )}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'left'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          letterSpacing: '0.2px'
        }}>Add New Project</h1>
        <form onSubmit={handleSubmit} style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e8ecef'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Project Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Company</label>
              <select
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              >
                <option value="">Select Company</option>
                <option value="Kristellar Aerospace">Kristellar Aerospace</option>
                <option value="Kristellar Cyberspace">Kristellar Cyberspace</option>
                <option value="Protelion">Protelion</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Project Lead</label>
              <input
                type="text"
                name="lead"
                value={formData.lead}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Team Members (comma-separated)</label>
              <input
                type="text"
                name="team"
                value={formData.team.join(', ')}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Revenue (₹)</label>
              <input
                type="number"
                name="revenue"
                value={formData.revenue}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Upload Image</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
          </div>
          <div style={{
            marginBottom: '24px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '8px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
            }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                color: '#1e293b',
                minHeight: '100px'
              }}
            />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Timeline: Completed (%)</label>
              <input
                type="number"
                name="timeline.completed"
                value={formData.timeline.completed}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Timeline: In Progress (%)</label>
              <input
                type="number"
                name="timeline.inProgress"
                value={formData.timeline.inProgress}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
              }}>Timeline: Remaining (%)</label>
              <input
                type="number"
                name="timeline.remaining"
                value={formData.timeline.remaining}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1e293b'
                }}
              />
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '16px'
          }}>
            <button
              type="submit"
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
                letterSpacing: '0.2px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#005f73';
                e.target.style.transform = 'scale(1.04)';
                e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#0a9396';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
              }}
            >
              Add Project
            </button>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              style={{
                padding: '10px 24px',
                backgroundColor: '#aecfeeff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                letterSpacing: '0.2px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#005f73';
                e.target.style.transform = 'scale(1.04)';
                e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#aecfeeff';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProject;