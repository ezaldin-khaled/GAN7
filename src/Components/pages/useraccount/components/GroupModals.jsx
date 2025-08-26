import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './GroupsTab.css';

export const CreateBandModal = ({ 
  showCreateModal,
  handleCloseModal,
  newBand,
  handleInputChange,
  handleImageUpload,
  uploadedImage,
  loading,
  handleSubmitBand,
  setUploadedImage
}) => {
  if (!showCreateModal) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content mod-tsxt">
        <div className="modal-header mod-tsxt">
          <h2>Create New Band</h2>
        </div>
        <form onSubmit={handleSubmitBand}>
          {/* Form groups */}
          <div className="form-group">
            <label htmlFor="name">Band Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newBand.name}
              onChange={handleInputChange}
              placeholder="Enter band name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={newBand.description}
              onChange={handleInputChange}
              placeholder="Tell us about your band"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="genre">Band Type</label>
            <select
              id="genre"
              name="genre"
              value={newBand.genre}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select a band type</option>
              <option value="musical">Musical Bands/Troupes</option>
              <option value="theatrical">Theatrical Troupes</option>
              <option value="stunt">Stunt/Performance Teams</option>
              <option value="dance">Dance Troupes</option>
              <option value="event">Event Squads</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={newBand.location}
              onChange={handleInputChange}
              placeholder="City, Country"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact_email">Contact Email</label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={newBand.contact_email}
              onChange={handleInputChange}
              placeholder="email@example.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact_phone">Contact Phone</label>
            <input
              type="tel"
              id="contact_phone"
              name="contact_phone"
              value={newBand.contact_phone}
              onChange={handleInputChange}
              placeholder="+963123456789"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={newBand.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="profile_picture">Band Image</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="profile_picture"
                name="profile_picture"
                onChange={handleImageUpload}
                accept="image/*"
                className="file-input"
              />
              <label htmlFor="profile_picture" className="file-upload-label mod-tsxt">
                Choose Image
              </label>
              <span className="file-name">
                {uploadedImage ? uploadedImage.name : 'No file chosen'}
              </span>
            </div>
            {uploadedImage && (
              <div className="image-preview">
                <img src={URL.createObjectURL(uploadedImage)} alt="Preview" />
                <button 
                  type="button" 
                  className="remove-image" 
                  onClick={() => setUploadedImage(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating...
                </>
              ) : 'Create Band'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ManageBandModal = ({
  showManageModal,
  handleCloseManageModal,
  selectedBand,
  editBand,
  handleEditInputChange,
  handleEditImageUpload,
  editImage,
  loading,
  handleUpdateBand,
  setEditImage,
  handleMemberRoleChange,
  handleRemoveMember,
  membersToRemove
}) => {
  if (!showManageModal || !selectedBand) return null;
  
  // Add a state to toggle between band details and member management
  const [showMembersTab, setShowMembersTab] = useState(false);
  
  // Create a wrapper for the update function to handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    handleUpdateBand(e);
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content mod-tsxt">
        <div className="modal-header mod-tsxt">
          <h2>Manage Band: {selectedBand.name}</h2>
          <div className="tab-navigation">
            <button 
              type="button" 
              className={`tab-button ${!showMembersTab ? 'active' : ''}`}
              onClick={() => setShowMembersTab(false)}
            >
              Band Details
            </button>
            <button 
              type="button" 
              className={`tab-button ${showMembersTab ? 'active' : ''}`}
              onClick={() => setShowMembersTab(true)}
            >
              Members
            </button>
          </div>
        </div>
        
        {!showMembersTab ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="edit-name">Band Name *</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={editBand.name}
                onChange={handleEditInputChange}
                placeholder="Enter band name"
                required
              />
            </div>
            
            {/* Other band details form fields */}
            <div className="form-group">
              <label htmlFor="edit-description">Description *</label>
              <textarea
                id="edit-description"
                name="description"
                value={editBand.description}
                onChange={handleEditInputChange}
                placeholder="Tell us about your band"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-genre">Band Type</label>
              <select
                id="edit-genre"
                name="genre"
                value={editBand.genre}
                onChange={handleEditInputChange}
                className="form-select"
                disabled={true} // Band type cannot be changed after creation
              >
                <option value="">Select a band type</option>
                <option value="musical">Musical Bands/Troupes</option>
                <option value="theatrical">Theatrical Troupes</option>
                <option value="stunt">Stunt/Performance Teams</option>
                <option value="dance">Dance Troupes</option>
                <option value="event">Event Squads</option>
              </select>
              {editBand.genre && (
                <small className="form-note">Band type cannot be changed after creation</small>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-location">Location</label>
              <input
                type="text"
                id="edit-location"
                name="location"
                value={editBand.location}
                onChange={handleEditInputChange}
                placeholder="City, Country"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-contact_email">Contact Email</label>
              <input
                type="email"
                id="edit-contact_email"
                name="contact_email"
                value={editBand.contact_email}
                onChange={handleEditInputChange}
                placeholder="email@example.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-website">Website</label>
              <input
                type="url"
                id="edit-website"
                name="website"
                value={editBand.website}
                onChange={handleEditInputChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-profile_picture">Band Image</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="edit-profile_picture"
                  name="profile_picture"
                  onChange={handleEditImageUpload}
                  accept="image/*"
                  className="file-input"
                />
                <label htmlFor="edit-profile_picture" className="file-upload-label mod-tsxt">
                  Choose New Image
                </label>
                <span className="file-name">
                  {editImage ? editImage.name : 'No new image chosen'}
                </span>
              </div>
              {selectedBand.profile_picture && !editImage && (
                <div className="current-image">
                  <img 
                    src={selectedBand.profile_picture} 
                    alt={selectedBand.name} 
                    style={{ maxWidth: '100px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {editImage && (
                <div className="image-preview">
                  <img src={URL.createObjectURL(editImage)} alt="Preview" />
                  <button 
                    type="button" 
                    className="remove-image" 
                    onClick={() => setEditImage(null)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCloseManageModal}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Updating...
                  </>
                ) : 'Update Band'}
              </button>
            </div>
          </form>
        ) : (
          <div className="members-management">
            <h3>Band Members</h3>
            
            {selectedBand.members && selectedBand.members.length > 0 ? (
              <>
                <div className="members-table">
                  <div className="members-table-header">
                    <div className="member-col">Member</div>
                    <div className="role-col">Role</div>
                    <div className="joined-col">Joined</div>
                    <div className="actions-col">Actions</div>
                  </div>
                  
                  <div className="members-table-body">
                    {selectedBand.members.map(member => (
                      <div key={member.id} className="member-row">
                        <div className="member-col">
                          <div className="member-avatar">
                            {member.profile_picture ? (
                              <img 
                                src={member.profile_picture} 
                                alt={member.username || member.full_name || member.email || 'Member'}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="avatar-placeholder">
                                {(member.username || member.full_name || member.email || 'M').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="member-details">
                            <span className="member-username">{member.username || member.full_name || member.email || 'Unknown Member'}</span>
                            {member.email && <span className="member-email">{member.email}</span>}
                          </div>
                        </div>
                        
                        <div className="role-col">
                          {member.position === "Creator" ? (
                            <span className="creator-badge">Creator</span>
                          ) : (
                            <select 
                              value={member.role}
                              onChange={(e) => handleMemberRoleChange(member.id, e.target.value)}
                              disabled={loading}
                              className="role-select"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </div>
                        
                        <div className="joined-col">
                          {member.date_joined ? new Date(member.date_joined).toLocaleDateString() : 'N/A'}
                        </div>
                        
                        <div className="actions-col">
                          {member.position !== "Creator" && (
                            <button 
                              type="button"
                              className={`remove-member-btn ${membersToRemove?.includes(member.id) ? 'marked-for-removal' : ''}`}
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={loading}
                            >
                              {membersToRemove?.includes(member.id) ? 'Marked for Removal' : 'Remove'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="admin-limits-info">
                  <p>
                    <strong>Admin Limits:</strong> 
                    {selectedBand.members.length < 5 ? " 1 admin (creator only)" : 
                     selectedBand.members.length < 25 ? " 2 admins maximum" : 
                     " 3 admins maximum"}
                  </p>
                  <p className="note">
                    Note: The band creator's role cannot be changed, and they cannot be removed from the band.
                  </p>
                </div>
              </>
            ) : (
              <div className="empty-members">
                <p>No members found in this band.</p>
              </div>
            )}
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCloseManageModal}>
                Close
              </button>
              <button 
                type="button" 
                className="submit-btn" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};