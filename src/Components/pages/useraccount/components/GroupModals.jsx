import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
  if (!showCreateModal) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content mod-tsxt">
        <div className="modal-header mod-tsxt">
          <h2>{t('groups.createBandTitle')}</h2>
        </div>
        <form onSubmit={handleSubmitBand}>
          {/* Form groups */}
          <div className="form-group">
            <label htmlFor="name">{t('groups.bandName')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newBand.name}
              onChange={handleInputChange}
              placeholder={t('groups.enterBandName')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">{t('groups.description')} *</label>
            <textarea
              id="description"
              name="description"
              value={newBand.description}
              onChange={handleInputChange}
              placeholder={t('groups.tellUsAboutBand')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="genre">{t('groups.bandType')}</label>
            <select
              id="genre"
              name="genre"
              value={newBand.genre}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">{t('groups.selectBandType')}</option>
              <option value="musical">{t('groups.musicalBands')}</option>
              <option value="theatrical">{t('groups.theatricalTroupes')}</option>
              <option value="stunt">{t('groups.stuntTeams')}</option>
              <option value="dance">{t('groups.danceTroupes')}</option>
              <option value="event">{t('groups.eventSquads')}</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">{t('groups.location')}</label>
            <input
              type="text"
              id="location"
              name="location"
              value={newBand.location}
              onChange={handleInputChange}
              placeholder={t('groups.cityCountry')}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact_email">{t('groups.contactEmail')}</label>
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
            <label htmlFor="contact_phone">{t('groups.contactPhone')}</label>
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
            <label htmlFor="website">{t('groups.website')}</label>
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
            <label htmlFor="profile_picture">{t('groups.bandImage')}</label>
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
                {t('groups.chooseImage')}
              </label>
              <span className="file-name">
                {uploadedImage ? uploadedImage.name : t('groups.noFileChosen')}
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
                  {t('groups.remove')}
                </button>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCloseModal}>
              {t('groups.cancel')}
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  {t('groups.creating')}
                </>
              ) : t('groups.createBand')}
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
  const { t } = useTranslation();
  
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
          <h2>{t('groups.manageBand')}: {selectedBand.name}</h2>
          <div className="tab-navigation">
            <button 
              type="button" 
              className={`tab-button ${!showMembersTab ? 'active' : ''}`}
              onClick={() => setShowMembersTab(false)}
            >
              {t('groups.bandDetails')}
            </button>
            <button 
              type="button" 
              className={`tab-button ${showMembersTab ? 'active' : ''}`}
              onClick={() => setShowMembersTab(true)}
            >
              {t('groups.members')}
            </button>
          </div>
        </div>
        
        {!showMembersTab ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="edit-name">{t('groups.bandName')} *</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={editBand.name}
                onChange={handleEditInputChange}
                placeholder={t('groups.enterBandName')}
                required
              />
            </div>
            
            {/* Other band details form fields */}
            <div className="form-group">
              <label htmlFor="edit-description">{t('groups.description')} *</label>
              <textarea
                id="edit-description"
                name="description"
                value={editBand.description}
                onChange={handleEditInputChange}
                placeholder={t('groups.tellUsAboutBand')}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-genre">{t('groups.bandType')}</label>
              <select
                id="edit-genre"
                name="genre"
                value={editBand.genre}
                onChange={handleEditInputChange}
                className="form-select"
                disabled={true} // Band type cannot be changed after creation
              >
                <option value="">{t('groups.selectBandType')}</option>
                <option value="musical">{t('groups.musicalBands')}</option>
                <option value="theatrical">{t('groups.theatricalTroupes')}</option>
                <option value="stunt">{t('groups.stuntTeams')}</option>
                <option value="dance">{t('groups.danceTroupes')}</option>
                <option value="event">{t('groups.eventSquads')}</option>
              </select>
              {editBand.genre && (
                <small className="form-note">{t('groups.bandTypeCannotBeChanged')}</small>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-location">{t('groups.location')}</label>
              <input
                type="text"
                id="edit-location"
                name="location"
                value={editBand.location}
                onChange={handleEditInputChange}
                placeholder={t('groups.cityCountry')}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-contact_email">{t('groups.contactEmail')}</label>
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
              <label htmlFor="edit-website">{t('groups.website')}</label>
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
              <label htmlFor="edit-profile_picture">{t('groups.bandImage')}</label>
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
                  {t('groups.chooseNewImage')}
                </label>
                <span className="file-name">
                  {editImage ? editImage.name : t('groups.noNewImageChosen')}
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
                    {t('groups.remove')}
                  </button>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCloseManageModal}>
                {t('groups.cancel')}
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    {t('groups.updating')}
                  </>
                ) : t('groups.updateBand')}
              </button>
            </div>
          </form>
        ) : (
          <div className="members-management">
            <h3>{t('groups.bandMembers')}</h3>
            
            {selectedBand.members && selectedBand.members.length > 0 ? (
              <>
                <div className="members-table">
                  <div className="members-table-header">
                    <div className="member-col">{t('groups.member')}</div>
                    <div className="role-col">{t('groups.role')}</div>
                    <div className="joined-col">{t('groups.joined')}</div>
                    <div className="actions-col">{t('groups.actions')}</div>
                  </div>
                  
                  <div className="members-table-body">
                    {selectedBand.members.map(member => (
                      <div key={member.id} className="member-row">
                        <div className="member-col">
                          <div className="member-avatar">
                            {member.profile_picture ? (
                              <img 
                                src={member.profile_picture} 
                                alt={member.username || member.full_name || member.email || t('groups.member')}
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
                            <span className="member-username">{member.username || member.full_name || member.email || t('groups.unknownMember')}</span>
                            {member.email && <span className="member-email">{member.email}</span>}
                          </div>
                        </div>
                        
                        <div className="role-col">
                          {member.position === "Creator" ? (
                            <span className="creator-badge">{t('groups.creator')}</span>
                          ) : (
                            <select 
                              value={member.role}
                              onChange={(e) => handleMemberRoleChange(member.id, e.target.value)}
                              disabled={loading}
                              className="role-select"
                            >
                              <option value="member">{t('groups.member')}</option>
                              <option value="admin">{t('adminDashboard.adminUser')}</option>
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
                              {membersToRemove?.includes(member.id) ? t('groups.markedForRemoval') : t('groups.remove')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="admin-limits-info">
                  <p>
                    <strong>{t('groups.adminLimits')}:</strong> 
                    {selectedBand.members.length < 5 ? ` 1 ${t('groups.adminLimitsMessage')}` : 
                     selectedBand.members.length < 25 ? ` 2 ${t('groups.adminLimitsMessage')}` : 
                     ` 3 ${t('groups.adminLimitsMessage')}`}
                  </p>
                  <p className="note">
                    {t('groups.creatorRoleNote')}
                  </p>
                </div>
              </>
            ) : (
              <div className="empty-members">
                <p>{t('groups.noMembersFound')}</p>
              </div>
            )}
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCloseManageModal}>
                {t('groups.close')}
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
                    {t('groups.saving')}
                  </>
                ) : t('groups.saveChanges')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};