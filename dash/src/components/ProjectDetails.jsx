import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

function ProjectDetails() {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [isEditing, setIsEditing] = useState(false);
  const [capxModalOpen, setCapxModalOpen] = useState(false);
  const [opxModalOpen, setOpxModalOpen] = useState(false);
  const [capxData, setCapxData] = useState([
    { id: 1, item: 'Equipment', amount: 50000, date: '2025-01-15', description: 'Purchase of machinery' },
    { id: 2, item: 'Infrastructure', amount: 25000, date: '2025-02-10', description: 'Facility upgrades' }
  ]);
  const [opxData, setOpxData] = useState([
    { id: 1, item: 'Salaries', amount: 30000, date: '2025-01-30', description: 'Monthly payroll' },
    { id: 2, item: 'Utilities', amount: 5000, date: '2025-02-01', description: 'Electricity and water' }
  ]);

  // TEMP / ORIGINAL snapshots for modal editing
  const [tempCapxData, setTempCapxData] = useState(null);
  const [originalCapxData, setOriginalCapxData] = useState(null);
  const [tempOpxData, setTempOpxData] = useState(null);
  const [originalOpxData, setOriginalOpxData] = useState(null);

  // extract fetchProject so we can refresh after saving modal changes
  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}`);
      const project = await response.json();
      if (response.ok) {
        setFormData({
          ...project,
          startDate: formatDate(project.start_date),
          endDate: formatDate(project.end_date),
          timeline: {
            completed: project.timeline_completed,
            inProgress: project.timeline_in_progress,
            remaining: project.timeline_remaining
          }
        });

        setPreviewImage(project.image);
        setCapxData(project.capx || []);
        setOpxData(project.opx || []);
      } else {
        setNotification({ message: 'Project not found', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } catch (error) {
      setNotification({ message: 'Error fetching project', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  // Open modal helpers to initialize temps when editing
  const openCapxModal = () => {
    if (isEditing) {
      setTempCapxData(capxData.map(r => ({ ...r })));
      setOriginalCapxData(capxData.map(r => ({ ...r })));
    } else {
      setTempCapxData(null);
      setOriginalCapxData(null);
    }
    setCapxModalOpen(true);
  };

  const openOpxModal = () => {
    if (isEditing) {
      setTempOpxData(opxData.map(r => ({ ...r })));
      setOriginalOpxData(opxData.map(r => ({ ...r })));
    } else {
      setTempOpxData(null);
      setOriginalOpxData(null);
    }
    setOpxModalOpen(true);
  };

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
      setFormData({ ...formData, image: file });
      setPreviewImage(imageUrl);
    } else {
      setNotification({ message: 'Please upload a valid image (PNG, JPEG, or WebP).', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  // Add row: if editing + modal open => add to temp only (local). Otherwise (view mode) optionally POST immediately.
  const addCapxRow = async () => {
    if (isEditing && capxModalOpen) {
      const newRow = {
        id: -Date.now(), // negative temp id to indicate unsaved row
        projectId: id,
        item: '',
        amount: 0,
        date: null,
        description: ''
      };
      setTempCapxData(prev => (prev ? [...prev, newRow] : [newRow]));
      return;
    }

    // non-editing fallback: immediate backend create
    try {
      const newCapx = { projectId: id, item: '', amount: 0, date: null, description: '' };
      const response = await fetch(`http://localhost:5000/api/projects/${id}/capx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(newCapx)
      });
      const result = await response.json();
      if (response.ok) {
        setCapxData([...capxData, result.capx]);
        setNotification({ message: 'CAPX row added successfully', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      } else {
        setNotification({ message: result.message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } catch (error) {
      setNotification({ message: 'Error adding CAPX row', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const addOpxRow = async () => {
    if (isEditing && opxModalOpen) {
      const newRow = { id: -Date.now(), projectId: id, item: '', amount: 0, date: null, description: '' };
      setTempOpxData(prev => (prev ? [...prev, newRow] : [newRow]));
      return;
    }

    // non-edit fallback
    try {
      const newOpx = { projectId: id, item: '', amount: 0, date: null, description: '' };
      const response = await fetch(`http://localhost:5000/api/projects/${id}/opx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(newOpx)
      });
      const result = await response.json();
      if (response.ok) {
        setOpxData([...opxData, result.opx]);
        setNotification({ message: 'OPX row added successfully', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      } else {
        setNotification({ message: result.message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } catch (error) {
      setNotification({ message: 'Error adding OPX row', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const handleCapxInputChange = (idParam, field, value) => {
    if (isEditing && capxModalOpen) {
      const updated = (tempCapxData || []).map(item =>
        item.id === idParam ? { ...item, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : item
      );
      setTempCapxData(updated);
      return;
    }

    const updatedCapxData = capxData.map(item =>
      item.id === idParam ? { ...item, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : item
    );
    setCapxData(updatedCapxData);
  };

  const handleOpxInputChange = (idParam, field, value) => {
    if (isEditing && opxModalOpen) {
      const updated = (tempOpxData || []).map(item =>
        item.id === idParam ? { ...item, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : item
      );
      setTempOpxData(updated);
      return;
    }

    const updatedOpxData = opxData.map(item =>
      item.id === idParam ? { ...item, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : item
    );
    setOpxData(updatedOpxData);
  };

  // Delete: if editing and modal open -> remove locally. Otherwise perform backend delete.
  const deleteCapx = async (rowId) => {
    if (isEditing && capxModalOpen) {
      setTempCapxData(prev => (prev || []).filter(item => item.id !== rowId));
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/projects/capx/${rowId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const result = await response.json();
      if (response.ok) {
        setCapxData(capxData.filter(item => item.id !== rowId));
        setNotification({ message: 'CAPX deleted successfully', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      } else {
        setNotification({ message: result.message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } catch (error) {
      setNotification({ message: 'Error deleting CAPX', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const deleteOpx = async (rowId) => {
    if (isEditing && opxModalOpen) {
      setTempOpxData(prev => (prev || []).filter(item => item.id !== rowId));
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/projects/opx/${rowId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const result = await response.json();
      if (response.ok) {
        setOpxData(opxData.filter(item => item.id !== rowId));
        setNotification({ message: 'OPX deleted successfully', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      } else {
        setNotification({ message: result.message, visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } catch (error) {
      setNotification({ message: 'Error deleting OPX', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  // Save modal changes -> sync local temp -> backend (POST new, PUT existing, DELETE removed)
  const saveCapxChanges = async () => {
    if (!(isEditing && capxModalOpen)) {
      // fallback to previous behavior: update existing capxData entries via PUT
      for (const capx of capxData) {
        if (!capx.item || !capx.amount || !capx.date) {
          setNotification({ message: 'Please provide all required fields: item, amount, date for all CAPX rows.', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
          return;
        }
      }
      try {
        for (const capx of capxData) {
          const response = await fetch(`http://localhost:5000/api/projects/capx/${capx.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify(capx)
          });
          const result = await response.json();
          if (!response.ok) {
            setNotification({ message: result.message, visible: true });
            setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
            return;
          }
        }
        setNotification({ message: 'All CAPX rows updated successfully', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
        setCapxModalOpen(false);
      } catch (error) {
        setNotification({ message: 'Error updating CAPX rows', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
      return;
    }

    const temp = tempCapxData || [];
    // validate
    for (const capx of temp) {
      if (!capx.item || !capx.amount || !capx.date) {
        setNotification({ message: 'Please provide all required fields: item, amount, date for all CAPX rows.', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
        return;
      }
    }

    try {
      // determine creates, updates and deletes
      const originals = originalCapxData || [];
      const originalsById = new Map(originals.filter(r => r.id > 0).map(r => [r.id, r]));
      const tempIds = new Set(temp.filter(r => r.id > 0).map(r => r.id));

      // deletes: ids present in originals but missing in temp
      const toDelete = originals.filter(r => r.id > 0 && !tempIds.has(r.id)).map(r => r.id);

      // creations: temp rows with negative ids
      const toCreate = temp.filter(r => r.id < 0);

      // updates: temp rows with positive ids (we'll PUT them)
      const toUpdate = temp.filter(r => r.id > 0);

      // perform deletes
      for (const delId of toDelete) {
        const res = await fetch(`http://localhost:5000/api/projects/capx/${delId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        if (!res.ok) {
          const err = await res.json();
          setNotification({ message: err.message || 'Error deleting CAPX', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
          return;
        }
      }

      // perform updates
      for (const capx of toUpdate) {
        const res = await fetch(`http://localhost:5000/api/projects/capx/${capx.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(capx)
        });
        if (!res.ok) {
          const err = await res.json();
          setNotification({ message: err.message || 'Error updating CAPX', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
          return;
        }
      }

      // perform creates
      for (const capx of toCreate) {
        const payload = { projectId: id, item: capx.item, amount: capx.amount, date: capx.date, description: capx.description };
        const res = await fetch(`http://localhost:5000/api/projects/${id}/capx`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json();
          setNotification({ message: err.message || 'Error creating CAPX', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
          return;
        }
      }

      // refresh from backend
      await fetchProject();
      setNotification({ message: 'CAPX changes saved successfully', visible: true });
      setTempCapxData(null);
      setOriginalCapxData(null);
      setCapxModalOpen(false);
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    } catch (error) {
      setNotification({ message: 'Error saving CAPX rows', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const saveOpxChanges = async () => {
    if (!(isEditing && opxModalOpen)) {
      // fallback to previous behavior: update existing opxData entries via PUT
      for (const opx of opxData) {
        if (!opx.item || !opx.amount || !opx.date) {
          setNotification({ message: 'Please provide all required fields: item, amount, date for all OPX rows.', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
          return;
        }
      }
      try {
        for (const opx of opxData) {
          const response = await fetch(`http://localhost:5000/api/projects/opx/${opx.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify(opx)
          });
          const result = await response.json();
          if (!response.ok) {
            setNotification({ message: result.message, visible: true });
            setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
            return;
          }
        }
        setNotification({ message: 'All OPX rows updated successfully', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
        setOpxModalOpen(false);
      } catch (error) {
        setNotification({ message: 'Error updating OPX rows', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
      return;
    }

    const temp = tempOpxData || [];
    for (const opx of temp) {
      if (!opx.item || !opx.amount || !opx.date) {
        setNotification({ message: 'Please provide all required fields: item, amount, date for all OPX rows.', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
        return;
      }
    }

    try {
      const originals = originalOpxData || [];
      const tempIds = new Set(temp.filter(r => r.id > 0).map(r => r.id));

      const toDelete = originals.filter(r => r.id > 0 && !tempIds.has(r.id)).map(r => r.id);
      const toCreate = temp.filter(r => r.id < 0);
      const toUpdate = temp.filter(r => r.id > 0);

      for (const delId of toDelete) {
        const res = await fetch(`http://localhost:5000/api/projects/opx/${delId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        if (!res.ok) {
          const err = await res.json();
          setNotification({ message: err.message || 'Error deleting OPX', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
          return;
        }
      }

      for (const opx of toUpdate) {
        const res = await fetch(`http://localhost:5000/api/projects/opx/${opx.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(opx)
        });
        if (!res.ok) {
          const err = await res.json();
          setNotification({ message: err.message || 'Error updating OPX', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
          return;
        }
      }

      for (const opx of toCreate) {
        const payload = { projectId: id, item: opx.item, amount: opx.amount, date: opx.date, description: opx.description };
        const res = await fetch(`http://localhost:5000/api/projects/${id}/opx`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json();
          setNotification({ message: err.message || 'Error creating OPX', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
          return;
        }
      }

      await fetchProject();
      setNotification({ message: 'OPX changes saved successfully', visible: true });
      setTempOpxData(null);
      setOriginalOpxData(null);
      setOpxModalOpen(false);
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    } catch (error) {
      setNotification({ message: 'Error saving OPX rows', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  // Cancel modal changes => revert temp -> original and close
  const cancelCapxChanges = () => {
    setTempCapxData(null);
    setOriginalCapxData(null);
    setCapxModalOpen(false);
  };

  const cancelOpxChanges = () => {
    setTempOpxData(null);
    setOriginalOpxData(null);
    setOpxModalOpen(false);
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
        setNotification({ message: 'Project updated successfully', visible: true });
        setIsEditing(false);
        setCapxModalOpen(false);
        setOpxModalOpen(false);
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
      {capxModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>Capital Expenses (CAPX)</h2>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Amount (₹)</th>
                  <th>Date</th>
                  <th>Description</th>
                  {isEditing && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {(isEditing && tempCapxData ? tempCapxData : capxData).map(item => (
                  <tr key={item.id}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => handleCapxInputChange(item.id, 'item', e.target.value)}
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px' }}
                        />
                      ) : (
                        <span>{item.item}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleCapxInputChange(item.id, 'amount', e.target.value)}
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px' }}
                        />
                      ) : (
                        <span>₹{(item.amount || 0).toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="date"
                          // value={item.date ? new Date(item.date).toISOString().split('T')[0] : ''}
                          value={item.date ? formatDate(item.date) : ''}
                          onChange={(e) => handleCapxInputChange(item.id, 'date', e.target.value)}
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px' }}
                        />
                      ) : (
                        <span>{item.date ? new Date(item.date).toLocaleDateString('en-IN') : ''}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleCapxInputChange(item.id, 'description', e.target.value)}
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px' }}
                        />
                      ) : (
                        <span>{item.description}</span>
                      )}
                    </td>
                    {isEditing && (
                    <td>
                        <button
                          onClick={() => deleteCapx(item.id)}
                          style={{ padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px' }}
                        >
                          Delete
                        </button>
                    </td>
                      )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {isEditing && (
                <button
                  type="button"
                  onClick={addCapxRow}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0a9396',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >Add Row</button>
              )}
              {(isEditing) && (
                <button
                  onClick={saveCapxChanges}
                  style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px' }}
                >
                  Save
                </button>
                )}
              <button
                type="button"
                onClick={isEditing ? cancelCapxChanges : () => setCapxModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#aecfeeff',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
      {opxModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>Operational Expenses (OPX)</h2>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Amount (₹)</th>
                  <th>Date</th>
                  <th>Description</th>
                  {isEditing && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {(isEditing && tempOpxData ? tempOpxData : opxData).map(item => (
                  <tr key={item.id}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => handleOpxInputChange(item.id, 'item', e.target.value)}
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px' }}
                        />
                      ) : (
                        <span>{item.item}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleOpxInputChange(item.id, 'amount', e.target.value)}
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px' }}
                        />
                      ) : (
                        <span>₹{(item.amount || 0).toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="date"
                          // value={item.date ? new Date(item.date).toISOString().split('T')[0] : ''}
                          value={item.date ? formatDate(item.date) : ''}
                          onChange={(e) => handleOpxInputChange(item.id, 'date', e.target.value)}
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px' }}
                        />
                      ) : (
                        <span>{item.date ? new Date(item.date).toLocaleDateString('en-IN') : ''}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleOpxInputChange(item.id, 'description', e.target.value)}
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px' }}
                        />
                      ) : (
                        <span>{item.description}</span>
                      )}
                    </td>
                      {isEditing && (
                    <td>
                        <button
                          onClick={() => deleteOpx(item.id)}
                          style={{ padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px' }}
                        >
                          Delete
                        </button>
                    </td>
                      )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {isEditing && (
                <button
                  type="button"
                  onClick={addOpxRow}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0a9396',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >Add Row</button>
              )}
              {(isEditing) && (
                <button
                  onClick={saveOpxChanges}
                  style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px' }}
                >
                  Save
                </button>
                )}
              <button
                type="button"
                onClick={isEditing ? cancelOpxChanges : () => setOpxModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#aecfeeff',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >Close</button>
            </div>
          </div>
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
        }}>{formData?.name || 'Project Not Found'}</h1>
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '24px',
          position: 'relative',
          paddingTop: '25%',
          backgroundColor: '#f0f4f8',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          {formData && (
            <img
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
          )}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
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
              backgroundColor: '#f7f9fc',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '12px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ margin: '6px 0' }}>
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Expenses:</strong>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={openCapxModal}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0a9396',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >CAPX</button>
                  <button
                    type="button"
                    onClick={openOpxModal}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0a9396',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >OPX</button>
                </div>
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
                  setCapxModalOpen(false);
                  setOpxModalOpen(false);
                  setPreviewImage(formData.image);
                  // discard any temp modal edits if still open
                  setTempCapxData(null);
                  setOriginalCapxData(null);
                  setTempOpxData(null);
                  setOriginalOpxData(null);
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
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Description:</strong> {formData?.description}
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
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Project Lead:</strong> {formData?.lead}
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
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Company:</strong> {formData?.company}
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
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Team Members:</strong> {formData?.team.join(', ')}
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
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Revenue:</strong> ₹{formData?.revenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div style={{
              backgroundColor: '#f7f9fc',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '12px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ margin: '6px 0' }}>
                <strong style={{ color: '#0a9396', fontWeight: '600' }}>Expenses:</strong>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={openCapxModal}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0a9396',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >CAPX</button>
                  <button
                    type="button"
                    onClick={openOpxModal}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0a9396',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >OPX</button>
                </div>
              </div>
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
                  <strong style={{ color: '#0a9396', fontWeight: '600' }}>Start Date:</strong> {formData && new Date(formData.startDate).toLocaleString('en-IN', {
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
                  <strong style={{ color: '#0a9396', fontWeight: '600' }}>End Date:</strong> {formData && new Date(formData.endDate).toLocaleString('en-IN', {
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