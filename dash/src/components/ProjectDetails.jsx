import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ProjectDetails() {
  const { id } = useParams();
  const [formData, setFormData] = useState(null); // Initialize as null
  const [previewImage, setPreviewImage] = useState('');
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/projects/${id}`);
        const project = await response.json();
        console.log("Result:",project);
        if (response.ok) {
          setFormData({
            ...project,
            startDate: project.start_date,
            endDate: project.end_date,
            timeline: {
              completed: project.timeline_completed,
              inProgress: project.timeline_in_progress,
              remaining: project.timeline_remaining
            }
          });
          setPreviewImage(project.image);
        } else {
          setNotification({ message: 'Project not found', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
        }
      } catch (error) {
        setNotification({ message: 'Error fetching project', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    };
    fetchProject();
  }, [id]);

  if (!formData) {
    return (
      <div className="dashboard" style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#1e293b',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textAlign: 'center',
          letterSpacing: '0.2px'
        }}>Project Not Found</h1>
      </div>
    );
  }

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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalTimeline = formData.timeline.completed + formData.timeline.inProgress + formData.timeline.remaining;
    if (totalTimeline !== 100) {
      setNotification({ message: 'Timeline percentages must sum to 100%.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      return;
    }
    if (!formData.name || !formData.lead || !formData.startDate || !formData.endDate || !formData.company) {
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
    } else {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'PUT',
        body: formDataToSend
      });
      const result = await response.json();
      if (response.ok) {
        setFormData({
          ...result.project,
          startDate: result.project.start_date,  
          endDate: result.project.end_date,
          timeline: {
            completed: result.project.timeline_completed,
            inProgress: result.project.timeline_in_progress,
            remaining: result.project.timeline_remaining
          }
        });
        setPreviewImage(result.project.image);
        setNotification({ message: result.message, visible: true });
        setIsEditing(false);
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      } else {
        setNotification({ message: result.message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } catch (error) {
      setNotification({ message: 'Error updating project', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const timelineData = formData ? {
    labels: ['Timeline'],
    datasets: [
      {
        label: 'Completed',
        data: [formData.timeline.completed],
        backgroundColor: '#0a9396',
        borderColor: '#005f73',
        borderWidth: 1,
        hoverBackgroundColor: '#0a9396cc'
      },
      {
        label: 'In Progress',
        data: [formData.timeline.inProgress],
        backgroundColor: '#94d2bd',
        borderColor: '#005f73',
        borderWidth: 1,
        hoverBackgroundColor: '#94d2bdcc'
      },
      {
        label: 'Remaining',
        data: [formData.timeline.remaining],
        backgroundColor: '#aecfeeff',
        borderColor: '#005f73',
        borderWidth: 1,
        hoverBackgroundColor: '#aecfeeffcc'
      }
    ]
  } : {
    labels: ['Timeline'],
    datasets: [
      {
        label: 'Completed',
        data: [0],
        backgroundColor: '#0a9396',
        borderColor: '#005f73',
        borderWidth: 1,
        hoverBackgroundColor: '#0a9396cc'
      },
      {
        label: 'In Progress',
        data: [0],
        backgroundColor: '#94d2bd',
        borderColor: '#005f73',
        borderWidth: 1,
        hoverBackgroundColor: '#94d2bdcc'
      },
      {
        label: 'Remaining',
        data: [0],
        backgroundColor: '#aecfeeff',
        borderColor: '#005f73',
        borderWidth: 1,
        hoverBackgroundColor: '#aecfeeffcc'
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, family: 'Segoe UI', weight: '500' },
          padding: 16,
          usePointStyle: true,
          boxWidth: 8,
          color: '#1e293b'
        }
      },
      title: {
        display: true,
        text: 'Project Timeline Progress',
        font: { size: 18, family: 'Segoe UI', weight: '600' },
        padding: { top: 16, bottom: 16 },
        color: '#1e293b'
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14, family: 'Segoe UI', weight: '600' },
        bodyFont: { size: 12, family: 'Segoe UI' },
        padding: 12
      }
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
        margin: '0 auto 24px auto',
        textAlign: 'left'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          letterSpacing: '0.2px'
        }}>{formData.name}</h1>
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '24px',
          position: 'relative',
          paddingTop: '25%',
          backgroundColor: '#f0f4f8',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <img
            // src={previewImage}
            src={`http://localhost:5000${previewImage}`}
            alt={formData.name}
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
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setIsEditing(true)}
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
            Edit Project
          </button>
        </div>
        {isEditing ? (
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
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setPreviewImage(project.image);
                  setFormData(project);
                }}
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
        ) : (
          <div style={{
            fontSize: '14px',
            color: '#1e293b',
            lineHeight: '1.7',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '0.2px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e8ecef'
          }}>
            <div style={{
              backgroundColor: '#f7f9fc',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '12px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <p style={{ margin: '6px 0' }}>
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Description:</strong> {formData.description}
              </p>
            </div>
            <div style={{
              backgroundColor: '#f7f9fc',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '12px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <p style={{ margin: '6px 0' }}>
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Project Lead:</strong> {formData.lead}
              </p>
            </div>
            <div style={{
              backgroundColor: '#f7f9fc',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '12px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <p style={{ margin: '6px 0' }}>
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Company:</strong> {formData.company}
              </p>
            </div>
            <div style={{
              backgroundColor: '#f7f9fc',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '12px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <p style={{ margin: '6px 0' }}>
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Team Members:</strong> {formData.team.join(', ')}
              </p>
            </div>
            <div style={{
              backgroundColor: '#f7f9fc',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '12px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <p style={{ margin: '6px 0' }}>
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Revenue:</strong> ₹{formData.revenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '24px'
            }}>
              <div style={{
                flex: 1,
                backgroundColor: '#f7f9fc',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '12px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
              }}>
                <p style={{ margin: '6px 0' }}>
                  <strong style={{ color: '#0a9396', fontWeight: '600' }}>Start Date:</strong> {new Date(formData.startDate).toLocaleString('en-IN',{
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#f7f9fc',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '12px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
              }}>
                <p style={{ margin: '6px 0' }}>
                  <strong style={{ color: '#0a9396', fontWeight: '600' }}>End Date:</strong> {new Date(formData.endDate).toLocaleString('en-IN',{
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="card" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
        maxWidth: '900px',
        margin: '0 auto',
        border: '1px solid #e8ecef'
      }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          letterSpacing: '0.2px'
        }}>Timeline Progress</h2>
        <div className="chart-container" style={{
          height: '240px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <Bar data={timelineData} options={options} />
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;