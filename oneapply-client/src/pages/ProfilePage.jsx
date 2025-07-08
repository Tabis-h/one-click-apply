import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  FiUser, FiEdit, FiSave, FiUpload, FiFileText, FiBriefcase, 
  FiPlus, FiEye, FiArrowRight, FiBarChart2, FiToggleLeft, FiToggleRight,
  FiX, FiTrash2, FiCalendar, FiMapPin, FiMail, FiPhone, FiLinkedin,
  FiGithub, FiGlobe, FiCheck, FiAlertCircle
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { validateProfileForm, validateExperienceForm, validateFileUpload } from '../utils/validation';
import { formatDate, formatDateRange, calculateDuration } from '../utils/dateHelpers';
import { useProfile } from '../hooks/useProfile';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FiX />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Toast Notification Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? <FiCheck /> : <FiAlertCircle />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2">
        <FiX />
      </button>
    </motion.div>
  );
};

// Experience Form Component
const ExperienceForm = ({ experience, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    ...experience
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company *
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position *
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, State"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="month"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="month"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            disabled={formData.current}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="current"
          checked={formData.current}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          I currently work here
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe your responsibilities and achievements..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Save Experience
        </button>
      </div>
    </form>
  );
};

// Profile Info Form Component
const ProfileInfoForm = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    ...profile
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, State, Country"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn
          </label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GitHub
          </label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleChange}
            placeholder="https://github.com/username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Professional Summary
        </label>
        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          rows={4}
          placeholder="Brief summary of your professional background and goals..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
                      Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

// Job Preferences Form Component
const JobPreferencesForm = ({ preferences, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    jobTypes: [],
    locations: [],
    salaryRange: { min: '', max: '' },
    remote: false,
    industries: [],
    ...preferences
  });

  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
  const industryOptions = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Sales', 'Design', 'Engineering'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleSalaryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Job Types
        </label>
        <div className="grid grid-cols-2 gap-2">
          {jobTypeOptions.map(type => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.jobTypes.includes(type)}
                onChange={() => handleArrayChange('jobTypes', type)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Industries
        </label>
        <div className="grid grid-cols-2 gap-2">
          {industryOptions.map(industry => (
            <label key={industry} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.industries.includes(industry)}
                onChange={() => handleArrayChange('industries', industry)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{industry}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Locations (comma-separated)
        </label>
        <input
          type="text"
          value={formData.locations.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            locations: e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc)
          }))}
          placeholder="New York, San Francisco, Remote"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Salary Range (USD)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              placeholder="Minimum"
              value={formData.salaryRange.min}
              onChange={(e) => handleSalaryChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Maximum"
              value={formData.salaryRange.max}
              onChange={(e) => handleSalaryChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="remote"
          checked={formData.remote}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Open to remote work
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
};

const ProfilePage = () => {
  const [user, authLoading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToRecruiters, setShowToRecruiters] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showJobPreferencesModal, setShowJobPreferencesModal] = useState(false);
  const [showDemographicModal, setShowDemographicModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            setUserProfile(profileData);
            setShowToRecruiters(profileData?.visibleToRecruiters || false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          showToast('Error loading profile', 'error');
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [user, authLoading, navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const handleResumeUpload = async () => {
    if (!resumeFile || !user) return;
    
    setUploading(true);
    try {
      // Delete old resume if exists
      if (userProfile?.resumeURL) {
        try {
          const oldResumeRef = ref(storage, `resumes/${user.uid}/${userProfile.resumeFilename}`);
          await deleteObject(oldResumeRef);
        } catch (error) {
          console.log("Old resume not found or already deleted");
        }
      }

      const storageRef = ref(storage, `resumes/${user.uid}/${resumeFile.name}`);
      await uploadBytes(storageRef, resumeFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        resumeURL: downloadURL,
        resumeFilename: resumeFile.name,
        resumeLastUpdated: new Date(),
      });

      setUserProfile(prev => ({ 
        ...prev, 
        resumeURL: downloadURL, 
        resumeFilename: resumeFile.name,
        resumeLastUpdated: new Date()
      }));
      setResumeFile(null);
      showToast('Resume uploaded successfully!');
    } catch (error) {
      console.error("Error uploading resume:", error);
      showToast('Error uploading resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!user || !userProfile?.resumeURL) return;
    
    try {
      const resumeRef = ref(storage, `resumes/${user.uid}/${userProfile.resumeFilename}`);
      await deleteObject(resumeRef);
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        resumeURL: null,
        resumeFilename: null,
        resumeLastUpdated: null,
      });

      setUserProfile(prev => ({ 
        ...prev, 
        resumeURL: null, 
        resumeFilename: null,
        resumeLastUpdated: null
      }));
      showToast('Resume deleted successfully!');
    } catch (error) {
      console.error("Error deleting resume:", error);
      showToast('Error deleting resume', 'error');
    }
  };

  const toggleRecruiterVisibility = async () => {
    const newValue = !showToRecruiters;
    setShowToRecruiters(newValue);
    
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          visibleToRecruiters: newValue
        });
        showToast(`Profile ${newValue ? 'visible to' : 'hidden from'} recruiters`);
      } catch (error) {
        console.error("Error updating visibility:", error);
        showToast('Error updating visibility', 'error');
        setShowToRecruiters(!newValue); // Revert on error
      }
    }
  };

  const handleProfileSave = async (profileData) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...profileData,
        updatedAt: new Date()
      });
      
      setUserProfile(prev => ({ ...prev, ...profileData }));
      setShowProfileModal(false);
      showToast('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast('Error updating profile', 'error');
    }
  };

  const handleExperienceSave = async (experienceData) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const experiences = userProfile?.experiences || [];
      
      let updatedExperiences;
      if (editingExperience !== null) {
        // Update existing experience
        updatedExperiences = experiences.map((exp, index) => 
          index === editingExperience ? { ...experienceData, id: Date.now() } : exp
        );
      } else {
        // Add new experience
        updatedExperiences = [...experiences, { ...experienceData, id: Date.now() }];
      }
      
      await updateDoc(userDocRef, {
        experiences: updatedExperiences,
        updatedAt: new Date()
      });
      
      setUserProfile(prev => ({ ...prev, experiences: updatedExperiences }));
      setShowExperienceModal(false);
      setEditingExperience(null);
      showToast('Experience saved successfully!');
    } catch (error) {
      console.error("Error saving experience:", error);
      showToast('Error saving experience', 'error');
    }
  };

  const handleExperienceDelete = async (index) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const experiences = userProfile?.experiences || [];
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      
      await updateDoc(userDocRef, {
        experiences: updatedExperiences,
        updatedAt: new Date()
      });
      
      setUserProfile(prev => ({ ...prev, experiences: updatedExperiences }));
      showToast('Experience deleted successfully!');
    } catch (error) {
      console.error("Error deleting experience:", error);
      showToast('Error deleting experience', 'error');
    }
  };

  const handleJobPreferencesSave = async (preferencesData) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        jobPreferences: preferencesData,
        updatedAt: new Date()
      });
      
      setUserProfile(prev => ({ ...prev, jobPreferences: preferencesData }));
      setShowJobPreferencesModal(false);
      showToast('Job preferences updated successfully!');
    } catch (error) {
      console.error("Error updating job preferences:", error);
      showToast('Error updating job preferences', 'error');
    }
  };

  const handleDemographicSave = async (demographicData) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        demographics: demographicData,
        updatedAt: new Date()
      });
      
      setUserProfile(prev => ({ ...prev, demographics: demographicData }));
      setShowDemographicModal(false);
      showToast('Demographic data updated successfully!');
    } catch (error) {
            console.error("Error updating demographic data:", error);
      showToast('Error updating demographic data', 'error');
    }
  };

  const openResumePreview = () => {
    if (userProfile?.resumeURL) {
      window.open(userProfile.resumeURL, '_blank');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <p className="text-gray-600 mb-4">Please complete your profile setup</p>
          <button 
            onClick={() => navigate('/profile-setup')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const initials = getInitials(`${userProfile.firstName} ${userProfile.lastName}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.show} 
        onClose={hideToast} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="w-full lg:w-3/12">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl font-semibold text-indigo-600 mb-4">
                  {initials}
                </div>
                <h2 className="text-lg font-semibold text-center">
                  {userProfile.firstName} {userProfile.lastName}
                </h2>
                <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Actively looking
                </span>
                
                {/* Contact Info */}
                <div className="mt-4 space-y-2 text-sm text-gray-600 w-full">
                  {userProfile.email && (
                    <div className="flex items-center">
                      <FiMail className="mr-2" size={14} />
                      <span className="truncate">{userProfile.email}</span>
                    </div>
                  )}
                  {userProfile.phone && (
                    <div className="flex items-center">
                      <FiPhone className="mr-2" size={14} />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
                  {userProfile.location && (
                    <div className="flex items-center">
                      <FiMapPin className="mr-2" size={14} />
                      <span className="truncate">{userProfile.location}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="mt-4 flex gap-2">
                  {userProfile.linkedin && (
                    <a 
                      href={userProfile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      <FiLinkedin size={16} />
                    </a>
                  )}
                  {userProfile.github && (
                    <a 
                      href={userProfile.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-full"
                    >
                      <FiGithub size={16} />
                    </a>
                  )}
                  {userProfile.website && (
                    <a 
                      href={userProfile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                    >
                      <FiGlobe size={16} />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  My Career Hub
                </h3>
                
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-3 bg-teal-50 rounded-lg flex items-center justify-between cursor-pointer"
                  onClick={() => setShowProfileModal(true)}
                >
                  <div className="flex items-center">
                    <FiEdit className="text-teal-600 mr-3" />
                    <span className="text-sm font-medium">Edit autofill information</span>
                  </div>
                  <FiArrowRight className="text-gray-400" />
                </motion.div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer"
                  onClick={() => setShowDemographicModal(true)}
                >
                  <div className="flex items-center">
                    <FiBarChart2 className="text-indigo-600 mr-3" />
                    <span className="text-sm font-medium">Edit demographic data</span>
                  </div>
                  <FiArrowRight className="text-gray-400" />
                </motion.div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer"
                  onClick={() => setShowJobPreferencesModal(true)}
                >
                  <div className="flex items-center">
                    <FiBriefcase className="text-indigo-600 mr-3" />
                    <span className="text-sm font-medium">Refine your job search</span>
                  </div>
                  <FiArrowRight className="text-gray-400" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right Section - Profile Dashboard */}
          <div className="w-full lg:w-9/12">
            {/* Professional Summary */}
            {userProfile.summary && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-3">Professional Summary</h2>
                <p className="text-gray-700 leading-relaxed">{userProfile.summary}</p>
              </div>
            )}

            {/* Top Info Banner */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Your OneApply profile is used directly to autofill your job applications!</span>
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Show Profile to Recruiters</h3>
                    <button 
                      onClick={toggleRecruiterVisibility}
                      className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none"
                    >
                      <span className={`${showToRecruiters ? 'bg-indigo-600' : 'bg-gray-200'} inline-block w-11 h-6 rounded-full transition-transform`}>
                        <span className={`${showToRecruiters ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform absolute top-1`} />
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Get discovered by companies. Your current employer can't see you.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Get More Referrals</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Find hidden connections and warm intros...
                  </p>
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition">
                    Set-Up Network
                  </button>
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Resume</h2>
              </div>
              
              {userProfile.resumeURL ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FiFileText className="text-gray-500 mr-3" />
                      <span className="text-sm font-medium">
                        {userProfile.resumeFilename || 'resume.pdf'}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      Default
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Last uploaded: {new Date(userProfile.resumeLastUpdated?.toDate() || new Date()).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => document.getElementById('resume-upload').click()}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="Replace resume"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      onClick={openResumePreview}
                      className="px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50 transition flex items-center gap-1"
                    >
                      <FiEye size={14} /> Preview Resume
                    </button>
                    <button 
                      onClick={handleDeleteResume}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Delete resume"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">No resume uploaded</p>
                  <button 
                    onClick={() => document.getElementById('resume-upload').click()}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition flex items-center gap-1"
                  >
                    <FiUpload size={14} /> Upload Resume
                  </button>
                </div>
              )}
              
              <input 
                id="resume-upload"
                type="file" 
                onChange={(e) => setResumeFile(e.target.files[0])} 
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
              
              {resumeFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    Ready to upload: {resumeFile.name}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setResumeFile(null)}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleResumeUpload}
                      disabled={uploading}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Work Experience Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Work Experience</h2>
                <button 
                  onClick={() => {
                    setEditingExperience(null);
                    setShowExperienceModal(true);
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                >
                  <FiPlus />
                </button>
              </div>
              
                          {userProfile.experiences && userProfile.experiences.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.experiences.map((experience, index) => (
                    <motion.div 
                      key={experience.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{experience.position}</h3>
                          <p className="text-indigo-600 font-medium">{experience.company}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FiCalendar className="mr-1" size={14} />
                            <span>
                              {formatDate(experience.startDate)} - {
                                experience.current ? 'Present' : formatDate(experience.endDate)
                              }
                            </span>
                            {experience.location && (
                              <>
                                <span className="mx-2">•</span>
                                <FiMapPin className="mr-1" size={14} />
                                <span>{experience.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingExperience(index);
                              setShowExperienceModal(true);
                            }}
                            className="p-1 text-gray-500 hover:text-indigo-600"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleExperienceDelete(index)}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {experience.description && (
                        <p className="text-gray-700 text-sm leading-relaxed mt-3">
                          {experience.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <FiBriefcase className="mx-auto text-gray-400 text-2xl mb-2" />
                  <p className="text-gray-500">No experiences added</p>
                  <button 
                    onClick={() => {
                      setEditingExperience(null);
                      setShowExperienceModal(true);
                    }}
                    className="mt-3 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition flex items-center gap-1 mx-auto"
                  >
                    <FiPlus size={14} /> Add Experience
                  </button>
                </div>
              )}
            </div>

            {/* Job Preferences Display */}
            {userProfile.jobPreferences && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Job Preferences</h2>
                  <button 
                    onClick={() => setShowJobPreferencesModal(true)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                  >
                    <FiEdit />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {userProfile.jobPreferences.jobTypes?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Job Types</h3>
                      <div className="flex flex-wrap gap-1">
                        {userProfile.jobPreferences.jobTypes.map(type => (
                          <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {userProfile.jobPreferences.industries?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Industries</h3>
                      <div className="flex flex-wrap gap-1">
                        {userProfile.jobPreferences.industries.map(industry => (
                          <span key={industry} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {userProfile.jobPreferences.locations?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred Locations</h3>
                      <div className="flex flex-wrap gap-1">
                        {userProfile.jobPreferences.locations.map(location => (
                          <span key={location} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(userProfile.jobPreferences.salaryRange?.min || userProfile.jobPreferences.salaryRange?.max) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Salary Range</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        ${userProfile.jobPreferences.salaryRange.min || '0'} - ${userProfile.jobPreferences.salaryRange.max || '∞'}
                      </span>
                    </div>
                  )}
                </div>
                
                {userProfile.jobPreferences.remote && (
                  <div className="mt-4">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                      Open to Remote Work
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Edit Profile Information"
      >
        <ProfileInfoForm
          profile={userProfile}
          onSave={handleProfileSave}
          onCancel={() => setShowProfileModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showExperienceModal}
        onClose={() => {
          setShowExperienceModal(false);
          setEditingExperience(null);
        }}
        title={editingExperience !== null ? "Edit Experience" : "Add Experience"}
      >
        <ExperienceForm
          experience={editingExperience !== null ? userProfile.experiences[editingExperience] : null}
          onSave={handleExperienceSave}
          onCancel={() => {
            setShowExperienceModal(false);
            setEditingExperience(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showJobPreferencesModal}
        onClose={() => setShowJobPreferencesModal(false)}
        title="Job Search Preferences"
      >
        <JobPreferencesForm
          preferences={userProfile.jobPreferences || {}}
          onSave={handleJobPreferencesSave}
          onCancel={() => setShowJobPreferencesModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDemographicModal}
        onClose={() => setShowDemographicModal(false)}
        title="Demographic Information"
      >
        <DemographicForm
          demographics={userProfile.demographics || {}}
          onSave={handleDemographicSave}
          onCancel={() => setShowDemographicModal(false)}
        />
      </Modal>
    </div>
  );
};

// Demographic Form Component
const DemographicForm = ({ demographics, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    gender: '',
    ethnicity: '',
    veteranStatus: '',
    disabilityStatus: '',
    ...demographics
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This information is optional and used for diversity reporting purposes only. 
          It will not be shared with employers unless you explicitly choose to do so.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gender Identity
        </label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ethnicity
        </label>
        <select
          name="ethnicity"
          value={formData.ethnicity}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Prefer not to say</option>
          <option value="asian">Asian</option>
          <option value="black">Black or African American</option>
          <option value="hispanic">Hispanic or Latino</option>
          <option value="native-american">Native American</option>
          <option value="pacific-islander">Native Hawaiian or Pacific Islander</option>
          <option value="white">White</option>
          <option value="two-or-more">Two or more races</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Veteran Status
        </label>
        <select
          name="veteranStatus"
          value={formData.veteranStatus}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Prefer not to say</option>
          <option value="veteran">I am a veteran</option>
          <option value="not-veteran">I am not a veteran</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Disability Status
        </label>
        <select
          name="disabilityStatus"
          value={formData.disabilityStatus}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Prefer not to say</option>
          <option value="yes">Yes, I have a disability</option>
          <option value="no">No, I do not have a disability</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Save Information
        </button>
      </div>
    </form>
  );
};

export default ProfilePage;
