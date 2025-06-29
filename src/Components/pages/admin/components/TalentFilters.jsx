import React from 'react';

const TalentFilters = () => {
  return (
    <form className="talent-filters-form">
      <div className="sidebar-section">
        <input 
          className="sidebar-search input" 
          placeholder="Search talents..." 
        />
      </div>

      <div className="sidebar-section">
        <h4>General Filters</h4>
        <div className="mb-16">
          <label htmlFor="accountType">Account Type</label>
          <select id="accountType" className="input" defaultValue="">
            <option value="">All Types</option>
            <option value="personal">Personal</option>
            <option value="agency">Agency</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>
        <div className="mb-16">
          <label style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <input type="checkbox" style={{marginRight:'8px'}} />
            Verified Accounts Only
          </label>
        </div>
        <div className="mb-16">
          <label htmlFor="gender">Gender</label>
          <select id="gender" className="input" defaultValue="">
            <option value="">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="sidebar-section">
        <h4>Location</h4>
        <label style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <input type="checkbox" defaultChecked style={{marginRight:'8px'}} />
          Search Anywhere
        </label>
        {/* Country and City dropdowns can be added here if not searching anywhere */}
      </div>

      <div className="sidebar-section">
        <h4>Visual Worker Filters</h4>
        <div className="mb-16">
          <label>Photography Experience (years)</label>
          <div style={{display:'flex',gap:'8px'}}>
            <input 
              className="input" 
              type="number" 
              min="0" 
              placeholder="Min" 
              style={{width:'50%'}} 
            />
            <input 
              className="input" 
              type="number" 
              min="0" 
              placeholder="Max" 
              style={{width:'50%'}} 
            />
          </div>
        </div>
        <div className="mb-16">
          <label>Video Experience (years)</label>
          <div style={{display:'flex',gap:'8px'}}>
            <input 
              className="input" 
              type="number" 
              min="0" 
              placeholder="Min" 
              style={{width:'50%'}} 
            />
            <input 
              className="input" 
              type="number" 
              min="0" 
              placeholder="Max" 
              style={{width:'50%'}} 
            />
          </div>
        </div>
        <div className="mb-16">
          <label>Specialties</label>
          <select className="input" multiple style={{height:'120px'}}>
            <option>Portrait Photography</option>
            <option>Landscape Photography</option>
            <option>Commercial Photography</option>
            <option>Product Photography</option>
            <option>Wedding Photography</option>
            <option>Documentary</option>
            <option>Fashion</option>
            <option>Sports</option>
            <option>Other</option>
          </select>
        </div>
      </div>
    </form>
  );
};

export default TalentFilters; 