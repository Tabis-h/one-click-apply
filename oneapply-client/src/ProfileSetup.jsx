import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { db, auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    photoURL: '',
    jobRoles: [],
    location: '',
    targetCountries: [],
    skills: [],
    experience: '',
    education: '',
    preferredSalary: '',
    workType: '',
    industries: [],
    languages: [],
    certifications: [],
    availability: '',
    linkedinProfile: '',
    portfolioWebsite: ''
  });

  const [jobInput, setJobInput] = useState('');
  const [jobSuggestions, setJobSuggestions] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [certificationInput, setCertificationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const nameParts = currentUser.displayName ? currentUser.displayName.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setForm(prev => ({
            ...prev,
            email: currentUser.email || '',
            firstName: prev.firstName || firstName,
            lastName: prev.lastName || lastName,
            photoURL: currentUser.photoURL || ''
        }));
    }
  }, []);


  // Enhanced job roles database
  const jobRolesDatabase = [
    "Software Engineer", "Frontend Developer", "Backend Developer", 
    "Full Stack Developer", "DevOps Engineer", "Data Scientist",
    "Machine Learning Engineer", "Product Manager", "UX Designer",
    "UI Developer", "Mobile Developer", "iOS Developer",
    "Android Developer", "QA Engineer", "Security Engineer",
    "Cloud Architect", "Database Administrator", "Technical Writer",
    "Scrum Master", "Data Analyst", "Business Analyst",
    "Project Manager", "System Administrator", "Network Engineer",
    "Embedded Systems Engineer", "Game Developer", "AR/VR Developer",
    "Blockchain Developer", "AI Researcher", "Computer Vision Engineer"
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Australia', 'Japan', 'Singapore', 'United Arab Emirates', 'India',
    'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark'
  ];

  const allSkills = [
    "JavaScript", "Python", "Java", "C++", "React", "Node.js", "Django",
    "Flutter", "Angular", "Vue", "Swift", "Kotlin", "Ruby", "PHP",
    "SQL", "MongoDB", "Machine Learning", "Data Science", "Cybersecurity",
    "DevOps", "AWS", "Azure", "Google Cloud", "UI/UX Design", "Figma",
    "Unity", "Unreal Engine", "Docker", "Kubernetes", "Git", "HTML/CSS",
    "TypeScript", "GraphQL", "Redis", "PostgreSQL", "MySQL", "Firebase"
  ];

  const industries = [
    "Technology", "Healthcare", "Finance", "Education", "E-commerce",
    "Gaming", "Media & Entertainment", "Automotive", "Real Estate",
    "Travel & Hospitality", "Food & Beverage", "Fashion", "Sports",
    "Non-profit", "Government", "Consulting", "Manufacturing", "Energy"
  ];

  const languages = [
    "English", "Spanish", "French", "German", "Chinese (Mandarin)",
    "Japanese", "Korean", "Portuguese", "Italian", "Russian",
    "Arabic", "Hindi", "Dutch", "Swedish", "Norwegian"
  ];

  // Handle job role input changes
  const handleJobInputChange = (e) => {
    const value = e.target.value;
    setJobInput(value);
    
    if (value.length >= 2) {
      const searchTerm = value.toLowerCase();
      const suggestions = jobRolesDatabase
        .filter(role => 
          role.toLowerCase().includes(searchTerm) && 
          !form.jobRoles.includes(role)
        )
        .slice(0, 5);
      setJobSuggestions(suggestions);
    } else {
      setJobSuggestions([]);
    }
  };

  // Add job role
  const handleJobRoleAdd = (role = null) => {
    const roleToAdd = role || jobInput.trim();
    
    if (roleToAdd && !form.jobRoles.includes(roleToAdd)) {
      setForm(prev => ({
        ...prev,
        jobRoles: [...prev.jobRoles, roleToAdd]
      }));
      setJobInput('');
      setJobSuggestions([]);
    }
  };

  // Handle Enter key press
  const handleJobInputKeyDown = (e) => {
    if (e.key === 'Enter' && jobInput.trim()) {
      e.preventDefault();
      handleJobRoleAdd();
    }
  };

  // Remove job role
  const handleJobRoleRemove = (role) => {
    setForm(prev => ({
      ...prev,
      jobRoles: prev.jobRoles.filter(r => r !== role)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCountrySelect = (country) => {
    setForm(prev => ({
      ...prev,
      targetCountries: prev.targetCountries.includes(country)
        ? prev.targetCountries.filter(c => c !== country)
        : [...prev.targetCountries, country]
    }));
  };

  const handleIndustrySelect = (industry) => {
    setForm(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  const handleLanguageSelect = (language) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSkillAdd = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleCertificationAdd = () => {
    if (certificationInput.trim() && !form.certifications.includes(certificationInput.trim())) {
      setForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, certificationInput.trim()]
      }));
      setCertificationInput('');
    }
  };

  const handleCertificationRemove = (cert) => {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Create comprehensive profile for job recommendations
      const profileData = {
        ...form,
        hasCompletedProfile: true,
        profileCompleteness: calculateProfileCompleteness(),
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add computed fields for better recommendations
        searchableSkills: form.skills.join(' ').toLowerCase(),
        searchableRoles: form.jobRoles.join(' ').toLowerCase(),
        experienceYears: getExperienceYears(form.experience),
        isRemotePreferred: form.workType === 'remote' || form.workType === 'hybrid',
        salaryExpectation: parseSalaryRange(form.preferredSalary)
      };

      await setDoc(doc(db, 'users', user.uid), profileData);
      navigate('/dashboard');

    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfileCompleteness = () => {
    const fields = [
      'firstName', 'lastName', 'location', 'experience', 'education', 'workType', 'availability'
    ];
    const arrayFields = ['jobRoles', 'targetCountries', 'skills', 'industries'];
    
    let completed = 0;
    let total = fields.length + arrayFields.length;

    fields.forEach(field => {
      if (form[field] && form[field].trim()) completed++;
    });

    arrayFields.forEach(field => {
      if (form[field] && form[field].length > 0) completed++;
    });

    return Math.round((completed / total) * 100);
  };

  const getExperienceYears = (experience) => {
    const mapping = {
      'entry': 1,
      'mid': 4,
      'senior': 8,
      'lead': 12,
      'executive': 18
    };
    return mapping[experience] || 0;
  };

  const parseSalaryRange = (salary) => {
    if (!salary) return null;
    const numbers = salary.match(/\d+/g);
    return numbers ? parseInt(numbers[0]) : null;
  };

  const totalSteps = 8;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-indigo-600 h-2.5 rounded-full"
              initial={{ width: `${(step / totalSteps) * 100}%` }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-right text-sm text-gray-500 mt-1">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Form content */}
        <motion.div
          key={step}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Let's start with your basic information</h2>
              <p className="text-gray-500 mb-6">This helps us personalize your job recommendations.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="First Name"
                    autoFocus
                  />
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Last Name"
                  />
                </div>
                
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Email Address"
                />
                
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Phone Number (Optional)"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!form.firstName.trim() || !form.lastName.trim()}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <FiArrowRight className="ml-2" />
                </button>
              </div>
            </>
          )}

          {/* Step 2: Job Roles & Experience */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What roles are you looking for?</h2>
              <p className="text-gray-500 mb-6">Add multiple job roles to get better recommendations</p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    value={jobInput}
                    onChange={handleJobInputChange}
                    onKeyDown={handleJobInputKeyDown}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Software Engineer, Data Scientist"
                    autoFocus
                  />
                  <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
                  
                  {jobSuggestions.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden shadow-md">
                      {jobSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleJobRoleAdd(suggestion)}
                          className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center"
                        >
                          <FiSearch className="text-gray-400 mr-2" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                                {/* Selected Job Roles */}
                {form.jobRoles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.jobRoles.map((role, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => handleJobRoleRemove(role)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select your experience level</option>
                    <option value="entry">0-2 years (Entry Level)</option>
                    <option value="mid">3-5 years (Mid Level)</option>
                    <option value="senior">6-10 years (Senior Level)</option>
                    <option value="lead">10+ years (Lead/Principal)</option>
                    <option value="executive">15+ years (Executive)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <FiArrowLeft className="mr-2" /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={form.jobRoles.length === 0 || !form.experience}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <FiArrowRight className="ml-2" />
                </button>
              </div>
            </>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Skills</h2>
              <p className="text-gray-500 mb-6">Add your technical and professional skills</p>
              
              <div className="space-y-4">
                <div className="flex">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSkillAdd()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. JavaScript, React, Project Management"
                    autoFocus
                  />
                  <button
                    onClick={handleSkillAdd}
                    className="px-4 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition"
                  >
                    <FiPlus size={20} />
                  </button>
                </div>

                {/* Popular Skills */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Popular skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.slice(0, 12).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => {
                          if (!form.skills.includes(skill)) {
                            setForm(prev => ({
                              ...prev,
                              skills: [...prev.skills, skill]
                            }));
                          }
                        }}
                        disabled={form.skills.includes(skill)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <FiArrowLeft className="mr-2" /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={form.skills.length === 0}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <FiArrowRight className="ml-2" />
                </button>
              </div>
            </>
          )}

          {/* Step 4: Location & Work Preferences */}
          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Location & Work Preferences</h2>
              <p className="text-gray-500 mb-6">Tell us about your location and work style preferences</p>
              
              <div className="space-y-4">
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Current City, Country"
                  autoFocus
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Type Preference</label>
                  <select
                    name="workType"
                    value={form.workType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select work type preference</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid (Remote + Office)</option>
                    <option value="onsite">On-site Only</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    name="availability"
                    value={form.availability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">When can you start?</option>
                    <option value="immediate">Immediately</option>
                    <option value="2weeks">Within 2 weeks</option>
                    <option value="1month">Within 1 month</option>
                    <option value="3months">Within 3 months</option>
                    <option value="not_looking">Not actively looking</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <FiArrowLeft className="mr-2" /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!form.location.trim() || !form.workType || !form.availability}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <FiArrowRight className="ml-2" />
                </button>
              </div>
            </>
          )}

          {/* Step 5: Target Countries */}
          {step === 5 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Where would you like to work?</h2>
              <p className="text-gray-500 mb-6">Select all countries you're interested in working</p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {countries.map(country => (
                  <div 
                    key={country} 
                    onClick={() => handleCountrySelect(country)}
                    className={`p-3 border rounded-lg cursor-pointer transition flex justify-between items-center ${
                      form.targetCountries.includes(country)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {country}
                    {form.targetCountries.includes(country) && (
                      <FiCheck className="text-indigo-600" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <FiArrowLeft className="mr-2" /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={form.targetCountries.length === 0}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <FiArrowRight className="ml-2" />
                </button>
              </div>
            </>
          )}

          {/* Step 6: Industries */}
          {step === 6 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Preferred Industries</h2>
              <p className="text-gray-500 mb-6">Select industries you're interested in working in</p>
              
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto mb-4">
                {industries.map(industry => (
                  <div 
                    key={industry} 
                    onClick={() => handleIndustrySelect(industry)}
                    className={`p-3 border rounded-lg cursor-pointer transition flex justify-between items-center ${
                      form.industries.includes(industry)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">{industry}</span>
                    {form.industries.includes(industry) && (
                      <FiCheck className="text-purple-600" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <FiArrowLeft className="mr-2" /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={form.industries.length === 0}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <FiArrowRight className="ml-2" />
                </button>
              </div>
            </>
          )}

          {/* Step 7: Education & Salary */}
          {step === 7 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Education & Salary Expectations</h2>
              <p className="text-gray-500 mb-6">Help us match you with appropriate opportunities</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                  <select
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select your education level</option>
                    <option value="high_school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="bootcamp">Bootcamp/Certificate</option>
                    <option value="self_taught">Self-taught</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Salary Range (Annual)</label>
                  <select
                                        name="preferredSalary"
                    value={form.preferredSalary}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select salary range</option>
                    <option value="30000-50000">$30,000 - $50,000</option>
                    <option value="50000-70000">$50,000 - $70,000</option>
                    <option value="70000-90000">$70,000 - $90,000</option>
                    <option value="90000-120000">$90,000 - $120,000</option>
                    <option value="120000-150000">$120,000 - $150,000</option>
                    <option value="150000-200000">$150,000 - $200,000</option>
                    <option value="200000+">$200,000+</option>
                  </select>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifications (Optional)</label>
                  <div className="flex">
                    <input
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCertificationAdd()}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. AWS Certified, PMP, Google Analytics"
                    />
                    <button
                      onClick={handleCertificationAdd}
                      className="px-4 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition"
                    >
                      <FiPlus size={20} />
                    </button>
                  </div>

                  {form.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                        >
                          {cert}
                          <button
                            type="button"
                            onClick={() => handleCertificationRemove(cert)}
                            className="ml-2 text-yellow-600 hover:text-yellow-800"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <FiArrowLeft className="mr-2" /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!form.education || !form.preferredSalary}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <FiArrowRight className="ml-2" />
                </button>
              </div>
            </>
          )}

          {/* Step 8: Languages & Final Details */}
          {step === 8 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Languages & Professional Links</h2>
              <p className="text-gray-500 mb-6">Final details to complete your profile</p>
              
              <div className="space-y-4">
                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages You Speak</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {languages.map(language => (
                      <div 
                        key={language} 
                        onClick={() => handleLanguageSelect(language)}
                        className={`p-2 border rounded cursor-pointer transition text-sm ${
                          form.languages.includes(language)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {language}
                        {form.languages.includes(language) && (
                          <FiCheck className="inline ml-1 text-green-600" size={12} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile (Optional)</label>
                  <input
                    name="linkedinProfile"
                    value={form.linkedinProfile}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio/Website (Optional)</label>
                  <input
                    name="portfolioWebsite"
                    value={form.portfolioWebsite}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                {/* Profile Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Profile Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Roles:</strong> {form.jobRoles.join(', ') || 'Not specified'}</p>
                    <p><strong>Experience:</strong> {form.experience || 'Not specified'}</p>
                    <p><strong>Skills:</strong> {form.skills.slice(0, 5).join(', ')}{form.skills.length > 5 ? '...' : ''}</p>
                    <p><strong>Target Countries:</strong> {form.targetCountries.slice(0, 3).join(', ')}{form.targetCountries.length > 3 ? '...' : ''}</p>
                    <p><strong>Profile Completeness:</strong> {calculateProfileCompleteness()}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <FiArrowLeft className="mr-2" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || form.languages.length === 0}
                  className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup <FiCheck className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* Step indicator dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 === step ? 'bg-indigo-600' : i + 1 < step ? 'bg-indigo-300' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
