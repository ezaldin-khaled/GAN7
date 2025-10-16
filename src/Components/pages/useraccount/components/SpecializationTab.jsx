import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import axiosInstance from '../../../../api/axios'; // Import the configured axios instance
import ProfileScore from './ProfileScore';
import Loader from '../../../common/Loader';
import './SpecializationTab.css';
import { TALENT_SPECIALIZATION_DATA, getTranslatedOptions } from './talent-specialization-data';
import { FaUpload, FaPlus, FaVideo, FaImage } from 'react-icons/fa';
import TestImagesUpload from './TestImagesUpload';
import './TestImagesUpload.css';
import './TabDescriptions.css';

const SpecializationTab = () => {
  const { t } = useTranslation();
  const [workerType, setWorkerType] = useState('visual_worker');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedVideos, setUploadedVideos] = useState({
    test_videos: [],
    about_yourself: null
  });
  const [uploadedImages, setUploadedImages] = useState({
    face_picture: null,
    mid_range_picture: null,
    full_body_picture: null
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [testImages, setTestImages] = useState({
    files: [],
    metadata: []
  });

  useEffect(() => {
    fetchSpecializationData();
  }, []);

  const fetchSpecializationData = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.get('/api/profile/specializations/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        if (response.data.visual_worker) {
          setWorkerType('visual_worker');
          setFormData(response.data.visual_worker);
        } else if (response.data.expressive_worker) {
          setWorkerType('expressive_worker');
          setFormData(response.data.expressive_worker);
        } else if (response.data.hybrid_worker) {
          setWorkerType('hybrid_worker');
          setFormData(response.data.hybrid_worker);
        }

        if (response.data.visual_worker_face_picture) {
          setUploadedImages(prev => ({
            ...prev,
            face_picture: response.data.visual_worker_face_picture
          }));
        }
        if (response.data.visual_worker_mid_range_picture) {
          setUploadedImages(prev => ({
            ...prev,
            mid_range_picture: response.data.visual_worker_mid_range_picture
          }));
        }
        if (response.data.visual_worker_full_body_picture) {
          setUploadedImages(prev => ({
            ...prev,
            full_body_picture: response.data.visual_worker_full_body_picture
          }));
        }

        if (response.data.test_images) {
          const testImagesData = {
            files: [],
            metadata: response.data.test_images
          };
          setTestImages(testImagesData);
        }

        if (response.data.about_yourself_video) {
          setUploadedVideos(prev => ({
            ...prev,
            about_yourself: {
              file: response.data.about_video,
              metadata: response.data.about_yourself_video
            }
          }));
        }

        if (response.data.test_videos) {
          const testVideos = response.data.test_videos.map((video, index) => ({
            index: index + 1,
            file: response.data[`test_video_${index + 1}`],
            metadata: video
          }));
          setUploadedVideos(prev => ({
            ...prev,
            test_videos: testVideos
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching specialization data:', err);
      if (err.response?.status === 404) {
        console.log('No specialization data found');
      } else {
        setError(t('specialization.failedToLoad'));
      }
    }
  };

  useEffect(() => {
    initializeFormData(workerType);
    setUploadedVideos({
      test_videos: [],
      about_yourself: null
    });
    setUploadedImages({
      face_picture: null,
      mid_range_picture: null,
      full_body_picture: null
    });
  }, [workerType]);

  const initializeFormData = (type) => {
    const initialData = {
      years_experience: 0,
      availability: 'full_time',
      willing_to_relocate: false,
      portfolio_link: '',
    };

    switch (type) {
      case 'visual_worker':
        Object.assign(initialData, {
          primary_category: '',
          experience_level: 'beginner',
          rate_range: 'low',
        });
        break;
      case 'expressive_worker':
        Object.assign(initialData, {
          performer_type: '',
          hair_color: '',
          hair_type: '',
          skin_tone: '',
          eye_color: '',
          eye_size: '',
          eye_pattern: '',
          face_shape: '',
          forehead_shape: '',
          lip_shape: '',
          eyebrow_pattern: '',
          beard_length: '',
          distinctive_facial_marks: '',
          distinctive_body_marks: '',
          voice_type: '',
          body_type: '',
          height: 0,
          weight: 0,
        });
        break;
      case 'hybrid_worker':
        Object.assign(initialData, {
          hybrid_type: '',
          hair_color: '',
          hair_type: '',
          eye_color: '',
          eye_size: '',
          eye_pattern: '',
          face_shape: '',
          forehead_shape: '',
          lip_shape: '',
          eyebrow_pattern: '',
          beard_length: '',
          distinctive_facial_marks: '',
          distinctive_body_marks: '',
          voice_type: '',
          skin_tone: '',
          body_type: '',
          fitness_level: 'beginner',
          risk_levels: 'low',
          height: 0,
          weight: 0,
        });
        break;
    }

    setFormData(initialData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('specialization.pleaseUploadValidImage'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError(t('specialization.imageSizeLimit'));
      return;
    }

    setUploadedImages(prev => ({
      ...prev,
      [imageType]: file
    }));
  };

  const handleVideoUpload = async (e, videoType, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError(t('specialization.pleaseUploadValidVideo'));
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError(t('specialization.videoSizeLimit'));
      return;
    }

    if (videoType === 'test_video') {
      setUploadedVideos(prev => ({
        ...prev,
        test_videos: [...prev.test_videos, { index, file }]
      }));
    } else {
      setUploadedVideos(prev => ({
        ...prev,
        about_yourself: { file }
      }));
    }
  };

  const handleTestImagesSelected = (images) => {
    setTestImages(images);
  };

  const isFormValid = () => {
    // Check if about yourself video is uploaded (required for all worker types)
    if (!uploadedVideos.about_yourself) {
      return false;
    }
    
    // For visual workers, check basic form fields
    if (workerType === 'visual_worker') {
      return formData.primary_category && formData.experience_level && formData.availability && formData.rate_range;
    }
    
    // Check if required test images are uploaded for actor/comparse/host
    if (workerType === 'expressive_worker' && 
        ['actor', 'comparse', 'host'].includes(formData.performer_type)) {
      return testImages.files.length === 4;
    }
    return true;
  };

  const getSubmitButtonText = () => {
    if (loading) return t('specialization.saving');
    
    if (!uploadedVideos.about_yourself) {
      return t('specialization.uploadAboutYourselfVideo');
    }
    
    if (workerType === 'expressive_worker' && 
        ['actor', 'comparse', 'host'].includes(formData.performer_type) && 
        testImages.files.length !== 4) {
      return t('specialization.uploadMoreTestImages', { count: 4 - testImages.files.length });
    }
    
    return t('specialization.saveSpecialization');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('access');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Extract user ID from JWT token
      let userId = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Token payload:', payload);
        userId = payload.user_id || payload.userId || payload.id;
        console.log('Extracted user ID from token:', userId);
        console.log('Available fields in token:', Object.keys(payload));
      } catch (error) {
        console.error('Error extracting user ID from token:', error);
        throw new Error('Invalid authentication token. Please log in again.');
      }

      if (!userId) {
        throw new Error('Could not identify user from authentication token.');
      }

      const formDataToSend = new FormData();

      // Prepare specialization data based on worker type
      const specializationData = {
        years_experience: formData.years_experience || 0,
        availability: formData.availability || 'full_time',
        willing_to_relocate: formData.willing_to_relocate || false,
        portfolio_link: formData.portfolio_link || '',
        worker_type: workerType
      };

      // Add type-specific fields
      switch (workerType) {
        case 'visual_worker':
          specializationData.primary_category = formData.primary_category || '';
          specializationData.experience_level = formData.experience_level || 'beginner';
          specializationData.rate_range = formData.rate_range || 'low';
          formDataToSend.append('visual_worker', JSON.stringify(specializationData));
          
          // Visual workers don't need to upload images
          // Removed image upload logic for visual workers
          break;

        case 'expressive_worker':
          specializationData.performer_type = formData.performer_type || '';
          specializationData.hair_color = formData.hair_color || '';
          specializationData.hair_type = formData.hair_type || '';
          specializationData.skin_tone = formData.skin_tone || '';
          specializationData.eye_color = formData.eye_color || '';
          specializationData.eye_size = formData.eye_size || '';
          specializationData.eye_pattern = formData.eye_pattern || '';
          specializationData.face_shape = formData.face_shape || '';
          specializationData.forehead_shape = formData.forehead_shape || '';
          specializationData.lip_shape = formData.lip_shape || '';
          specializationData.eyebrow_pattern = formData.eyebrow_pattern || '';
          specializationData.beard_length = formData.beard_length || '';
          specializationData.distinctive_facial_marks = formData.distinctive_facial_marks || '';
          specializationData.distinctive_body_marks = formData.distinctive_body_marks || '';
          specializationData.voice_type = formData.voice_type || '';
          specializationData.body_type = formData.body_type || '';
          specializationData.height = formData.height || 0;
          specializationData.weight = formData.weight || 0;
          formDataToSend.append('expressive_worker', JSON.stringify(specializationData));
          
          // Add expressive worker images
          if (uploadedImages.face_picture) {
            formDataToSend.append('face_picture_media_file', uploadedImages.face_picture);
          }
          if (uploadedImages.mid_range_picture) {
            formDataToSend.append('mid_range_picture_media_file', uploadedImages.mid_range_picture);
          }
          if (uploadedImages.full_body_picture) {
            formDataToSend.append('full_body_picture_media_file', uploadedImages.full_body_picture);
          }

          // Add test images if required
          const isExpressiveWorker = workerType === 'expressive_worker';
          const performerType = formData.performer_type;
          const requiresTestImages = isExpressiveWorker && 
            ['actor', 'comparse', 'host'].includes(performerType);

          if (requiresTestImages) {
            // For actor/comparse/host, exactly 4 test images are required
            if (testImages.files.length !== 4) {
              throw new Error('Exactly 4 test images are required for actor/comparse/host performers');
            }

            const testImagesMetadata = testImages.files.map((_, index) => ({
              name: `Test Image ${index + 1}`,
              media_info: "Test image for expressive worker",
              is_test_image: true,
              test_image_number: index + 1,
              user_id: userId
            }));
            formDataToSend.append('test_images', JSON.stringify(testImagesMetadata));
            testImages.files.forEach((image, index) => {
              if (image) {
                formDataToSend.append(`test_image_${index + 1}`, image);
              }
            });
          }
          break;

        case 'hybrid_worker':
          specializationData.hybrid_type = formData.hybrid_type || '';
          specializationData.hair_color = formData.hair_color || '';
          specializationData.hair_type = formData.hair_type || '';
          specializationData.eye_color = formData.eye_color || '';
          specializationData.eye_size = formData.eye_size || '';
          specializationData.eye_pattern = formData.eye_pattern || '';
          specializationData.face_shape = formData.face_shape || '';
          specializationData.forehead_shape = formData.forehead_shape || '';
          specializationData.lip_shape = formData.lip_shape || '';
          specializationData.eyebrow_pattern = formData.eyebrow_pattern || '';
          specializationData.beard_length = formData.beard_length || '';
          specializationData.distinctive_facial_marks = formData.distinctive_facial_marks || '';
          specializationData.distinctive_body_marks = formData.distinctive_body_marks || '';
          specializationData.voice_type = formData.voice_type || '';
          specializationData.skin_tone = formData.skin_tone || '';
          specializationData.body_type = formData.body_type || '';
          specializationData.fitness_level = formData.fitness_level || 'beginner';
          specializationData.risk_levels = formData.risk_levels || 'low';
          specializationData.height = formData.height || 0;
          specializationData.weight = formData.weight || 0;
          formDataToSend.append('hybrid_worker', JSON.stringify(specializationData));
          
          // Add hybrid worker images
          if (uploadedImages.face_picture) {
            formDataToSend.append('face_picture_media_file', uploadedImages.face_picture);
          }
          if (uploadedImages.mid_range_picture) {
            formDataToSend.append('mid_range_picture_media_file', uploadedImages.mid_range_picture);
          }
          if (uploadedImages.full_body_picture) {
            formDataToSend.append('full_body_picture_media_file', uploadedImages.full_body_picture);
          }
          break;
      }

      // Add user ID to the request
      formDataToSend.append('user_id', userId);
      formDataToSend.append('user', userId);
      formDataToSend.append('talent_id', userId);

      // Add about yourself video (required for all worker types)
      if (uploadedVideos.about_yourself) {
        const aboutYourselfData = {
          name: "About Yourself",
          media_info: "Talk about yourself",
          is_test_video: true,
          is_about_yourself_video: true,
          test_video_number: 5,
          user_id: userId
        };
        formDataToSend.append('about_yourself_video', JSON.stringify(aboutYourselfData));
        formDataToSend.append('about_video', uploadedVideos.about_yourself.file);
      } else {
        throw new Error('About yourself video is required for all worker types');
      }

      // Add test videos if required
      const isExpressiveWorker = workerType === 'expressive_worker';
      const performerType = formData.performer_type;
      const requiresTestVideos = isExpressiveWorker && 
        ['actor', 'comparse', 'host'].includes(performerType);

      if (requiresTestVideos) {
        if (uploadedVideos.test_videos.length !== 4) {
          throw new Error('Exactly 4 test videos are required for actor/comparse/host performers');
        }

        const testVideosData = uploadedVideos.test_videos.map((video, index) => ({
          name: `Test ${index + 1}`,
          media_info: "Test video for expressive worker",
          is_test_video: true,
          is_about_yourself_video: false,
          test_video_number: index + 1,
          user_id: userId
        }));
        formDataToSend.append('test_videos', JSON.stringify(testVideosData));

        // Add test video files
        uploadedVideos.test_videos.forEach((video, index) => {
          formDataToSend.append(`test_video_${index + 1}`, video.file);
        });
      }

      // Debug: Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
      }

      // Log the complete request details
      console.log('Request details:', {
        url: '/api/profile/specializations/',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: Object.fromEntries(formDataToSend.entries())
      });

      // Use the configured axiosInstance
      const response = await axiosInstance.post('/api/profile/specializations/', formDataToSend, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', progress + '%');
        },
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
        validateStatus: (status) => status < 500 // Accept all status codes less than 500
      });

      if (response.status === 400) {
        console.error('Validation error details:', response.data);
        throw new Error('Validation error: ' + JSON.stringify(response.data));
      }

      if (response.status === 500) {
        console.error('Server error details:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers
        });
        throw new Error('Server error: ' + (response.data?.message || 'Unknown error'));
      }

      setSuccess('Specialization saved successfully!');
      console.log('Response:', response.data);
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Request config:', err.config);
      console.error('Request headers:', err.config?.headers);
      
      if (err.message.includes('No authentication token found')) {
        setError(t('specialization.pleaseLoginAgain'));
      } else if (err.response?.status === 401) {
        setError(t('specialization.authenticationFailed'));
      } else if (err.response?.status === 500) {
        setError(t('specialization.serverError'));
      } else {
        setError(err.response?.data?.message || err.message || t('specialization.failedToSave'));
      }
      
      console.error('Error saving specialization:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/profile/specializations/', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('specialization.failedToUploadTestImages'));
      }

      setSuccess('Test images uploaded successfully!');
      setShowUploadModal(false);
    } catch (err) {
      setError(err.message || t('specialization.failedToUploadTestImages'));
    } finally {
      setLoading(false);
    }
  };

  const renderSelectField = (name, label, options) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleInputChange}
        required
      >
        <option value="">{t('specialization.selectOption', { label: label.toLowerCase() })}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderNumberField = (name, label, min = 0, step = 1, unit = '') => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        type="number"
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleInputChange}
        min={min}
        step={step}
        placeholder={unit ? t('specialization.enterValueWithUnit', { label: label.toLowerCase(), unit }) : t('specialization.enterValue', { label: label.toLowerCase() })}
        required
      />
    </div>
  );

  const renderImageUploadSection = () => (
    <div className="form-section">
      <h3>{t('specialization.profilePictures')}</h3>
      <div className="image-upload-grid">
        <div 
          className="image-upload-item"
          onClick={() => document.getElementById('face-picture-input').click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('drag-over');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              handleImageUpload({ target: { files: [file] } }, 'face_picture');
            }
          }}
        >
          <FaImage className="upload-icon" />
          <label>{t('specialization.facePicture')}</label>
          <input
            id="face-picture-input"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'face_picture')}
            disabled={loading}
            style={{ display: 'none' }}
          />
          {uploadedImages.face_picture ? (
            <div className="upload-preview">
              <img 
                src={URL.createObjectURL(uploadedImages.face_picture)} 
                alt="Face preview" 
                style={{ maxWidth: '100%', maxHeight: '150px' }}
              />
              <div className="upload-success">{t('specialization.uploaded')}</div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <p>{t('specialization.clickOrDragImage')}</p>
              <p className="upload-hint">{t('specialization.maxSizeImage')}</p>
            </div>
          )}
        </div>

        <div 
          className="image-upload-item"
          onClick={() => document.getElementById('mid-range-input').click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('drag-over');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              handleImageUpload({ target: { files: [file] } }, 'mid_range_picture');
            }
          }}
        >
          <FaImage className="upload-icon" />
          <label>{t('specialization.midRangePicture')}</label>
          <input
            id="mid-range-input"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'mid_range_picture')}
            disabled={loading}
            style={{ display: 'none' }}
          />
          {uploadedImages.mid_range_picture ? (
            <div className="upload-preview">
              <img 
                src={URL.createObjectURL(uploadedImages.mid_range_picture)} 
                alt="Mid-range preview" 
                style={{ maxWidth: '100%', maxHeight: '150px' }}
              />
              <div className="upload-success">{t('specialization.uploaded')}</div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <p>{t('specialization.clickOrDragImage')}</p>
              <p className="upload-hint">{t('specialization.maxSizeImage')}</p>
            </div>
          )}
        </div>

        <div 
          className="image-upload-item"
          onClick={() => document.getElementById('full-body-input').click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('drag-over');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              handleImageUpload({ target: { files: [file] } }, 'full_body_picture');
            }
          }}
        >
          <FaImage className="upload-icon" />
          <label>{t('specialization.fullBodyPicture')}</label>
          <input
            id="full-body-input"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'full_body_picture')}
            disabled={loading}
            style={{ display: 'none' }}
          />
          {uploadedImages.full_body_picture ? (
            <div className="upload-preview">
              <img 
                src={URL.createObjectURL(uploadedImages.full_body_picture)} 
                alt="Full body preview" 
                style={{ maxWidth: '100%', maxHeight: '150px' }}
              />
              <div className="upload-success">{t('specialization.uploaded')}</div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <p>{t('specialization.clickOrDragImage')}</p>
              <p className="upload-hint">{t('specialization.maxSizeImage')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVideoUploadSection = () => {
    const isExpressiveWorker = workerType === 'expressive_worker';
    const performerType = formData.performer_type;
    const requiresTestVideos = isExpressiveWorker && 
      ['actor', 'comparse', 'host'].includes(performerType);

    return (
      <div className="form-section">
        <h3>{t('specialization.videoRequirements')}</h3>
        
        {requiresTestVideos && (
          <div className="video-upload-section">
            <h4>{t('specialization.testVideosLabel')}</h4>
            <div className="video-grid">
              {[1, 2, 3, 4].map((index) => (
                <div 
                  key={index} 
                  className="video-upload-item"
                  onClick={() => document.getElementById(`test-video-input-${index}`).click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add('drag-over');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('drag-over');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('drag-over');
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('video/')) {
                      handleVideoUpload({ target: { files: [file] } }, 'test_video', index);
                    }
                  }}
                >
                  <FaVideo className="upload-icon" />
                  <label>{t('specialization.testVideo', { index })}</label>
                  <input
                    id={`test-video-input-${index}`}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoUpload(e, 'test_video', index)}
                    disabled={loading}
                    style={{ display: 'none' }}
                  />
                  {uploadedVideos.test_videos.find(v => v.index === index) ? (
                    <div className="upload-success">{t('specialization.uploaded')}</div>
                  ) : (
                    <div className="upload-placeholder">
                      <p>{t('specialization.clickOrDragVideo')}</p>
                      <p className="upload-hint">{t('specialization.maxSizeVideo')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="video-upload-section">
          <h4>{t('specialization.aboutYourselfVideo')}</h4>
          <div 
            className="video-upload-item"
            onClick={() => document.getElementById('about-yourself-input').click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add('drag-over');
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('drag-over');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove('drag-over');
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('video/')) {
                handleVideoUpload(e, 'about_yourself');
              }
            }}
          >
            <FaVideo className="upload-icon" />
            <label>{t('specialization.aboutYourself')}</label>
            <input
              id="about-yourself-input"
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoUpload(e, 'about_yourself')}
              disabled={loading}
              style={{ display: 'none' }}
            />
            {uploadedVideos.about_yourself ? (
              <div className="upload-success">{t('specialization.uploaded')}</div>
            ) : (
              <div className="upload-placeholder">
                <p>Click or drag video here</p>
                <p className="upload-hint">Max size: 100MB</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderVisualWorkerFields = () => (
    <>
      {renderSelectField('primary_category', t('specialization.primaryCategory'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.visual_worker.primary_categories, 'referenceData.primaryCategories', t))}
      {renderSelectField('experience_level', t('specialization.experienceLevel'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.visual_worker.experience_levels, 'referenceData.experienceLevel', t))}
      {renderSelectField('availability', t('specialization.availability'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.visual_worker.availability_choices, 'referenceData.availability', t))}
      {renderSelectField('rate_range', t('specialization.rateRange'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.visual_worker.rate_ranges, 'referenceData.rateRanges', t))}
      {renderNumberField('years_experience', t('specialization.yearsExperience'))}
      <div className="form-group">
        <label htmlFor="portfolio_link">{t('specialization.portfolioLink')}</label>
        <input
          type="url"
          id="portfolio_link"
          name="portfolio_link"
          value={formData.portfolio_link || ''}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="willing_to_relocate"
            checked={formData.willing_to_relocate || false}
            onChange={handleInputChange}
          />
          {t('specialization.willingToRelocate')}
        </label>
      </div>
    </>
  );

  const renderExpressiveWorkerFields = () => (
    <>
      {renderSelectField('performer_type', t('specialization.performerType'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.performer_types, 'referenceData.performerTypes', t))}
      {renderSelectField('hair_color', t('specialization.hairColor'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.hair_colors, 'referenceData.hairColors', t))}
      {renderSelectField('hair_type', t('specialization.hairType'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.hair_types, 'referenceData.hairTypes', t))}
      {renderSelectField('skin_tone', t('specialization.skinTone'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.skin_tones, 'referenceData.skinTones', t))}
      {renderSelectField('eye_color', t('specialization.eyeColor'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.eye_colors, 'referenceData.eyeColors', t))}
      {renderSelectField('eye_size', t('specialization.eyeSize'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.eye_sizes, 'referenceData.eyeSizes', t))}
      {renderSelectField('eye_pattern', t('specialization.eyePattern'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.eye_patterns, 'referenceData.eyePatterns', t))}
      {renderSelectField('face_shape', t('specialization.faceShape'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.face_shapes, 'referenceData.faceShapes', t))}
      {renderSelectField('forehead_shape', t('specialization.foreheadShape'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.forehead_shapes, 'referenceData.foreheadShapes', t))}
      {renderSelectField('lip_shape', t('specialization.lipShape'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.lip_shapes, 'referenceData.lipShapes', t))}
      {renderSelectField('eyebrow_pattern', t('specialization.eyebrowPattern'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.eyebrow_patterns, 'referenceData.eyebrowPatterns', t))}
      {renderSelectField('beard_length', t('specialization.beardLength'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.beard_lengths, 'referenceData.beardLengths', t))}
      {renderSelectField('distinctive_facial_marks', t('specialization.distinctiveFacialMarks'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.distinctive_facial_marks, 'referenceData.distinctiveFacialMarks', t))}
      {renderSelectField('distinctive_body_marks', t('specialization.distinctiveBodyMarks'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.distinctive_body_marks, 'referenceData.distinctiveBodyMarks', t))}
      {renderSelectField('voice_type', t('specialization.voiceType'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.voice_types, 'referenceData.voiceTypes', t))}
      {renderSelectField('body_type', t('specialization.bodyType'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.body_types, 'referenceData.bodyTypes', t))}
      {renderSelectField('availability', t('specialization.availability'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.expressive_worker.availability_choices, 'referenceData.availability', t))}
      {renderNumberField('height', t('specialization.height'), 0, 0.1, 'cm')}
      {renderNumberField('weight', t('specialization.weight'), 0, 0.1, 'kg')}
      {renderNumberField('years_experience', t('specialization.yearsExperience'))}
      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="willing_to_relocate"
            checked={formData.willing_to_relocate || false}
            onChange={handleInputChange}
          />
          {t('specialization.willingToRelocate')}
        </label>
      </div>
    </>
  );

  const renderHybridWorkerFields = () => (
    <>
      {renderSelectField('hybrid_type', t('specialization.hybridType'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.hybrid_types, 'referenceData.hybridTypes', t))}
      {renderSelectField('hair_color', t('specialization.hairColor'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.hair_colors, 'referenceData.hairColors', t))}
      {renderSelectField('hair_type', t('specialization.hairType'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.hair_types, 'referenceData.hairTypes', t))}
      {renderSelectField('eye_color', t('specialization.eyeColor'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.eye_colors, 'referenceData.eyeColors', t))}
      {renderSelectField('eye_size', t('specialization.eyeSize'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.eye_sizes, 'referenceData.eyeSizes', t))}
      {renderSelectField('eye_pattern', t('specialization.eyePattern'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.eye_patterns, 'referenceData.eyePatterns', t))}
      {renderSelectField('face_shape', t('specialization.faceShape'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.face_shapes, 'referenceData.faceShapes', t))}
      {renderSelectField('forehead_shape', t('specialization.foreheadShape'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.forehead_shapes, 'referenceData.foreheadShapes', t))}
      {renderSelectField('lip_shape', t('specialization.lipShape'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.lip_shapes, 'referenceData.lipShapes', t))}
      {renderSelectField('eyebrow_pattern', t('specialization.eyebrowPattern'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.eyebrow_patterns, 'referenceData.eyebrowPatterns', t))}
      {renderSelectField('beard_length', t('specialization.beardLength'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.beard_lengths, 'referenceData.beardLengths', t))}
      {renderSelectField('distinctive_facial_marks', t('specialization.distinctiveFacialMarks'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.distinctive_facial_marks, 'referenceData.distinctiveFacialMarks', t))}
      {renderSelectField('distinctive_body_marks', t('specialization.distinctiveBodyMarks'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.distinctive_body_marks, 'referenceData.distinctiveBodyMarks', t))}
      {renderSelectField('voice_type', t('specialization.voiceType'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.voice_types, 'referenceData.voiceTypes', t))}
      {renderSelectField('skin_tone', t('specialization.skinTone'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.skin_tones, 'referenceData.skinTones', t))}
      {renderSelectField('body_type', t('specialization.bodyType'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.body_types, 'referenceData.bodyTypes', t))}
      {renderSelectField('fitness_level', t('specialization.fitnessLevel'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.fitness_levels, 'referenceData.fitnessLevels', t))}
      {renderSelectField('risk_levels', t('specialization.riskLevel'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.risk_levels, 'referenceData.riskLevels', t))}
      {renderSelectField('availability', t('specialization.availability'), getTranslatedOptions(TALENT_SPECIALIZATION_DATA.hybrid_worker.availability_choices, 'referenceData.availability', t))}
      {renderNumberField('height', t('specialization.height'), 0, 0.1, 'cm')}
      {renderNumberField('weight', t('specialization.weight'), 0, 0.1, 'kg')}
      {renderNumberField('years_experience', t('specialization.yearsExperience'))}
      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="willing_to_relocate"
            checked={formData.willing_to_relocate || false}
            onChange={handleInputChange}
          />
          {t('specialization.willingToRelocate')}
        </label>
      </div>
    </>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="specialization-tab">
      <h2>{t('specialization.title')}</h2>
      
      {/* Tab Description */}
      <div className="tab-description specialization-theme">
        <div className="description-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="description-content">
          <h3>Talent Specialization & Categorization</h3>
          <p>Define your talent type and specialization to help casting directors and clients find you. Upload your portfolio and showcase your unique skills.</p>
        </div>
      </div>
      
      <ProfileScore />
      <form onSubmit={handleSubmit} className="specialization-form">
        <div className="worker-type-section">
          <label className="section-label">{t('specialization.workerType')}</label>
          <div className="worker-type-cards">
            <div 
              className={`worker-type-card ${workerType === 'visual_worker' ? 'selected' : ''}`}
              onClick={() => setWorkerType('visual_worker')}
            >
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                </svg>
              </div>
              <h3>{t('specialization.visualWorker')}</h3>
              <p>{t('specialization.visualWorkerDesc')}</p>
              <div className="card-checkmark">✓</div>
            </div>

            <div 
              className={`worker-type-card ${workerType === 'expressive_worker' ? 'selected' : ''}`}
              onClick={() => setWorkerType('expressive_worker')}
            >
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <h3>{t('specialization.expressiveWorker')}</h3>
              <p>{t('specialization.expressiveWorkerDesc')}</p>
              <div className="card-checkmark">✓</div>
            </div>

            <div 
              className={`worker-type-card ${workerType === 'hybrid_worker' ? 'selected' : ''}`}
              onClick={() => setWorkerType('hybrid_worker')}
            >
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3>{t('specialization.hybridWorker')}</h3>
              <p>{t('specialization.hybridWorkerDesc')}</p>
              <div className="card-checkmark">✓</div>
            </div>
          </div>
        </div>

        {workerType === 'visual_worker' && renderVisualWorkerFields()}
        {workerType === 'expressive_worker' && renderExpressiveWorkerFields()}
        {workerType === 'hybrid_worker' && renderHybridWorkerFields()}

        {/* Show image upload section only for non-visual workers */}
        {workerType !== 'visual_worker' && renderImageUploadSection()}
        
        {/* Show video upload section for all worker types (about yourself video is required for all) */}
        {renderVideoUploadSection()}

        {/* Show test images section only for expressive workers */}
        {workerType === 'expressive_worker' && (
          <div className="form-section">
            <h3>{t('specialization.testImages')}</h3>
            {['actor', 'comparse', 'host'].includes(formData.performer_type) ? (
              <>
                <p className="section-description">
                  <strong>{t('specialization.required')}:</strong> {t('specialization.exactlyRequired', { type: formData.performer_type })}
                </p>
                <p className="section-description">
                  {t('specialization.currentUploaded', { count: testImages.files.length })}
                </p>
                {testImages.files.length !== 4 && (
                  <p className="error-message">
                    {t('specialization.uploadExactly4Images')}
                  </p>
                )}
                {testImages.files.length > 0 && (
                  <div className="test-images-preview">
                    <h4>{t('specialization.uploadedTestImages')}</h4>
                    <div className="test-images-grid">
                      {testImages.files.map((image, index) => (
                        <div key={index} className="test-image-item">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Test image ${index + 1}`}
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                          />
                          <span>{t('specialization.imageNumber', { number: index + 1 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="section-description">
                {t('specialization.uploadTestImagesDescription')}
              </p>
            )}
            
            <button 
              type="button"
              className="upload-button"
              onClick={() => setShowUploadModal(true)}
            >
              <FaPlus className="button-icon" />
              {t('specialization.uploadTestImagesButton')}
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button 
          type="submit" 
          className="submit-button" 
          disabled={
            loading || 
            !uploadedVideos.about_yourself ||
            (workerType === 'expressive_worker' && 
             ['actor', 'comparse', 'host'].includes(formData.performer_type) && 
             testImages.files.length !== 4)
          }
        >
          {loading && <span className="loading-spinner"></span>}
          {getSubmitButtonText()}
        </button>
      </form>

      {showUploadModal && (
        <TestImagesUpload
          onClose={() => setShowUploadModal(false)}
          onImagesSelected={handleTestImagesSelected}
        />
      )}
    </div>
  );
};

export default SpecializationTab;
