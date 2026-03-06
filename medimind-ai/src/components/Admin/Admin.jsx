import React, { useState, useEffect } from "react";
import { Plus, Edit2, Clock, Droplet, X, Sun, Moon } from "lucide-react";
import {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  uploadDrugImage,
} from "../../services/database";
import "./Admin.css";

const Admin = ({ onBack }) => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    quantity: "1 pill",
    time: "",
    frequency: "Every morning",
    withWater: true,
    image: null,
  });

  // Load medications from Supabase on mount
  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await getMedications();
      setMedications(data);
    } catch (error) {
      console.error("Error loading medications:", error);
      alert("Failed to load medications");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase Storage
        const publicUrl = await uploadDrugImage(file);
        setFormData({ ...formData, image: publicUrl });
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const medicationData = {
      name: formData.name,
      dosage: formData.dosage,
      quantity: formData.quantity,
      time: formData.time,
      frequency: formData.frequency,
      with_water: formData.withWater,
      image_url: formData.image || previewImage,
    };

    try {
      if (editingMed) {
        await updateMedication(editingMed.id, medicationData);
      } else {
        await addMedication(medicationData);
      }

      await loadMedications(); // Reload from database
      resetForm();
      setShowAddForm(false);
      setEditingMed(null);
    } catch (error) {
      console.error("Error saving medication:", error);
      alert("Failed to save medication");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      quantity: "1 pill",
      time: "",
      frequency: "Every morning",
      withWater: true,
      image: null,
    });
    setPreviewImage(null);
  };

  const handleEdit = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      quantity: med.quantity,
      time: med.time,
      frequency: med.frequency,
      withWater: med.with_water,
      image: med.image_url,
    });
    setPreviewImage(med.image_url);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medication?"))
      return;

    try {
      await deleteMedication(id);
      await loadMedications(); // Reload from database
    } catch (error) {
      console.error("Error deleting medication:", error);
      alert("Failed to delete medication");
    }
  };

  const getFrequencyIcon = (frequency) => {
    if (frequency.includes("morning")) return <Sun size={24} color="#FFD700" />;
    if (frequency.includes("daily")) return <Clock size={24} color="#4A90E2" />;
    if (frequency.includes("Bedtime"))
      return <Moon size={24} color="#6B5B95" />;
    return (
      <img src="/drug-icon.jpeg" alt="pill" className="frequency-icon-img" />
    );
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading medications...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <button className="back-btn" onClick={onBack}>
          <img src="/back.jpeg" alt="Back" className="back-icon-img" />
        </button>
        <h1>Medication Setup</h1>
        <div className="header-spacer"></div>
      </header>

      <p className="admin-subtitle">
        Add or edit medications for the daily schedule.
      </p>

      {/* Medications List */}
      <div className="medications-list">
        {medications.length === 0 ? (
          <div className="empty-state">
            <p>No medications added yet.</p>
          </div>
        ) : (
          medications.map((med) => (
            <div key={med.id} className="medication-card">
              <div className="med-info">
                <div className="frequency-badge">
                  <span className="frequency-icon">
                    {getFrequencyIcon(med.frequency)}
                  </span>
                  <span>{med.frequency}</span>
                </div>

                <h3 className="med-name">{med.name}</h3>

                <div className="med-details">
                  <img
                    src="/drug-icon.jpeg"
                    alt="pill"
                    className="pill-icon-img"
                  />
                  <span>
                    {med.quantity} ({med.dosage})
                  </span>
                </div>

                <div className="med-schedule">
                  <Clock size={16} />
                  <span>{med.time}</span>
                  {med.with_water && (
                    <span className="water-badge">
                      <Droplet size={14} />
                      With water
                    </span>
                  )}
                </div>

                <div className="card-actions">
                  <button className="edit-btn" onClick={() => handleEdit(med)}>
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(med.id)}
                  >
                    <img
                      src="/delete.jpeg"
                      alt="Delete"
                      className="delete-icon-img"
                    />
                  </button>
                </div>
              </div>

              <div className="med-image">
                <img src={med.image_url || "/drug-icon.jpeg"} alt={med.name} />
              </div>
            </div>
          ))
        )}
      </div>

      <button className="add-new-btn" onClick={() => setShowAddForm(true)}>
        <Plus size={28} />
        Add New Medication
      </button>

      {/* Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingMed ? "Edit Medication" : "Add New Medication"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMed(null);
                  resetForm();
                }}
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="med-form">
              <div className="image-upload-section">
                <label className="image-upload-label">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="image-preview"
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <img
                        src="/drug-icon.jpeg"
                        alt="Camera"
                        className="camera-icon-img"
                      />
                      <span>Upload Drug Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                  />
                </label>
              </div>

              <div className="form-group">
                <label>Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g., Donepezil"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g., 5mg"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <select
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                  >
                    <option value="1 pill">1 pill</option>
                    <option value="2 pills">2 pills</option>
                    <option value="1 tablet">1 tablet</option>
                    <option value="2 tablets">2 tablets</option>
                    <option value="1 capsule">1 capsule</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                  >
                    <option value="Every morning">Every morning</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Bedtime">Bedtime</option>
                  </select>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.withWater}
                    onChange={(e) =>
                      setFormData({ ...formData, withWater: e.target.checked })
                    }
                  />
                  <span className="checkmark"></span>
                  <Droplet size={18} />
                  Take with water
                </label>
              </div>

              <button type="submit" className="submit-btn">
                {editingMed ? "Save Changes" : "Add Medication"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
