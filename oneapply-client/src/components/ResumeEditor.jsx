import React, { useState } from 'react';

function ResumeEditor({ resumeData, setResumeData }) {
  const [expandedSections, setExpandedSections] = useState({
    header: false,
    summary: false,
    education: false,
    experience: false,
    projects: false,
    skills: false,
    certifications: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper for grouped skills
  const skillTypes = [
    { key: 'language', label: 'Languages' },
    { key: 'framework', label: 'Frameworks' },
    { key: 'tool', label: 'Developer Tools' },
    { key: 'library', label: 'Libraries' },
  ];

  // General change handler
  const handleChange = (section, field, value, index = null, subfield = null) => {
    setResumeData((prev) => {
      const newData = { ...prev };
      if (index !== null) {
        const item = { ...newData[section][index] };
        if (subfield) {
          item[subfield] = value;
        } else {
          item[field] = value;
        }
        newData[section][index] = item;
      } else if (field) {
        newData[section] = { ...newData[section], [field]: value };
      } else {
        newData[section] = value;
      }
      return newData;
    });
  };

  // Add/remove helpers
  const addItem = (section, defaultItem) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: [...prev[section], defaultItem],
    }));
  };
  const removeItem = (section, index) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  // Skill add/remove
  const addSkill = (type) => {
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: '', type }],
    }));
  };
  const removeSkill = (index) => removeItem('skills', index);
  const updateSkill = (index, value) => {
    setResumeData((prev) => {
      const newSkills = [...prev.skills];
      if (newSkills[index]) {
        newSkills[index].name = value;
      }
      return { ...prev, skills: newSkills };
    });
  };

  // Certificate add/remove
  const addCertificate = () => {
    addItem('certifications', { name: '', issuer: '', year: '', link: '' });
  };
  const removeCertificate = (index) => removeItem('certifications', index);

  // Project bullets
  const addProjectBullet = (projIndex) => {
    setResumeData((prev) => {
      const newProjects = [...prev.projects];
      if (!newProjects[projIndex].bullets) newProjects[projIndex].bullets = [];
      newProjects[projIndex].bullets.push('');
      return { ...prev, projects: newProjects };
    });
  };
  const updateProjectBullet = (projIndex, bulletIndex, value) => {
    setResumeData((prev) => {
      const newProjects = [...prev.projects];
      newProjects[projIndex].bullets[bulletIndex] = value;
      return { ...prev, projects: newProjects };
    });
  };
  const removeProjectBullet = (projIndex, bulletIndex) => {
    setResumeData((prev) => {
      const newProjects = [...prev.projects];
      newProjects[projIndex].bullets = newProjects[projIndex].bullets.filter((_, i) => i !== bulletIndex);
      return { ...prev, projects: newProjects };
    });
  };

  // Experience bullets
  const addExpBullet = (expIndex) => {
    setResumeData((prev) => {
      const newExp = [...prev.experience];
      if (!newExp[expIndex].bullets) newExp[expIndex].bullets = [];
      newExp[expIndex].bullets.push('');
      return { ...prev, experience: newExp };
    });
  };
  const updateExpBullet = (expIndex, bulletIndex, value) => {
    setResumeData((prev) => {
      const newExp = [...prev.experience];
      newExp[expIndex].bullets[bulletIndex] = value;
      return { ...prev, experience: newExp };
    });
  };
  const removeExpBullet = (expIndex, bulletIndex) => {
    setResumeData((prev) => {
      const newExp = [...prev.experience];
      newExp[expIndex].bullets = newExp[expIndex].bullets.filter((_, i) => i !== bulletIndex);
      return { ...prev, experience: newExp };
    });
  };

  // Project add/remove
  const addProject = () => {
    addItem('projects', { title: '', tech: '', duration: '', link: '', bullets: [] });
  };
  const removeProject = (index) => removeItem('projects', index);

  // Education add/remove
  const addEducation = () => {
    addItem('education', { institute: '', degree: '', location: '', year: '' });
  };
  const removeEducation = (index) => removeItem('education', index);

  // Experience add/remove
  const addExperience = () => {
    addItem('experience', { role: '', company: '', location: '', duration: '', bullets: [] });
  };
  const removeExperience = (index) => removeItem('experience', index);

  // Collapsible Section Component
  const CollapsibleSection = ({ title, children, isExpanded, onToggle, showOptions = false }) => (
    <div className="border-b border-gray-200">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          {showOptions && (
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-gray-600">
                👁️ Hide Location
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                👁️ Hide Phone Number
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                👁️ Hide LinkedIn
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                ⚙️ Show GitHub
              </button>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500">Show Full URLs</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" />
                  <div className="block bg-blue-500 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </div>
            </div>
          )}
          <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="">
      {/* Resume Header Section */}
      <CollapsibleSection 
        title="Resume Header" 
        isExpanded={expandedSections.header}
        onToggle={() => toggleSection('header')}
        showOptions={true}
      >
        <div className="space-y-3">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location ⓘ</label>
            <input 
              type="text" 
              value={resumeData.header.location || ''} 
              onChange={e => handleChange('header', 'location', e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Belgaum, KA, India"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">👁️</span>
              <span className="text-sm text-gray-700">Hide Phone Number</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">👁️</span>
              <span className="text-sm text-gray-700">Hide LinkedIn</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">⚙️</span>
              <span className="text-sm text-gray-700">Show GitHub</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Show Full URLs</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className="block bg-blue-500 w-10 h-6 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Professional Summary Section */}
      <CollapsibleSection 
        title="Professional Summary" 
        isExpanded={expandedSections.summary}
        onToggle={() => toggleSection('summary')}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">ⓘ</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">👁️ Hide Summary</span>
              <span className="text-gray-400">▲</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-800">B</span>
                <span className="font-semibold text-gray-800 underline">U</span>
                <span className="font-semibold text-gray-800 italic">I</span>
                <span className="text-gray-600">🔗</span>
                <span className="text-gray-600">≡</span>
                <span className="text-gray-600">⋯</span>
                <span className="text-gray-600">↩️</span>
                <span className="text-gray-600">↪️</span>
                <span className="text-gray-600">↶</span>
                <span className="text-gray-600">↷</span>
              </div>
            </div>
            <textarea 
              placeholder="Write a brief professional summary..."
              value={resumeData.summary} 
              onChange={e => handleChange('summary', '', e.target.value)} 
              rows={4}
              className="w-full p-3 border-0 focus:outline-none resize-none" 
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Experience Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">💼</span> Experience
        </h2>
        <div className="space-y-4">
          {resumeData.experience.map((exp, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input 
                  type="text" 
                  placeholder="Role" 
                  value={exp.role} 
                  onChange={e => handleChange('experience', 'role', e.target.value, i)} 
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <input 
                  type="text" 
                  placeholder="Duration (e.g. Jan 2023 - May 2023)" 
                  value={exp.duration} 
                  onChange={e => handleChange('experience', 'duration', e.target.value, i)} 
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <input 
                  type="text" 
                  placeholder="Company" 
                  value={exp.company} 
                  onChange={e => handleChange('experience', 'company', e.target.value, i)} 
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <input 
                  type="text" 
                  placeholder="Location" 
                  value={exp.location || ''} 
                  onChange={e => handleChange('experience', 'location', e.target.value, i)} 
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <h3 className="font-semibold mb-2 text-gray-700">Key Achievements</h3>
              <div className="space-y-2">
                {(exp.bullets || []).map((bullet, bIndex) => (
                  <div key={bIndex} className="flex gap-2">
                    <input 
                      type="text" 
                      value={bullet} 
                      onChange={e => updateExpBullet(i, bIndex, e.target.value)} 
                      className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Describe your achievement..."
                    />
                    <button 
                      onClick={() => removeExpBullet(i, bIndex)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => addExpBullet(i)} 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  + Add Achievement
                </button>
                <button 
                  onClick={() => removeExperience(i)} 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Remove Experience
                </button>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={addExperience} 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors duration-200 flex items-center"
        >
          <span className="mr-2">+</span> Add Experience
        </button>
      </div>

      {/* Projects */}
      <section id="projects">
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        {resumeData.projects.map((proj, i) => (
          <div key={i} className="mb-4 border p-4 rounded">
            <input type="text" placeholder="Title" value={proj.title} onChange={e => handleChange('projects', 'title', e.target.value, i)} className="border p-2 mb-2 w-full" />
            <input type="text" placeholder="Tech (e.g. React, Node.js)" value={proj.tech || ''} onChange={e => handleChange('projects', 'tech', e.target.value, i)} className="border p-2 mb-2 w-full" />
            <input type="text" placeholder="Duration (e.g. Jan 2023 - May 2023)" value={proj.duration || ''} onChange={e => handleChange('projects', 'duration', e.target.value, i)} className="border p-2 mb-2 w-full" />
            <input type="text" placeholder="GitHub/Repo Link" value={proj.link || ''} onChange={e => handleChange('projects', 'link', e.target.value, i)} className="border p-2 mb-2 w-full" />
            <h3 className="font-semibold mb-2">Bullets</h3>
            {(proj.bullets || []).map((bullet, bIndex) => (
              <div key={bIndex} className="flex mb-2">
                <input type="text" value={bullet} onChange={e => updateProjectBullet(i, bIndex, e.target.value)} className="border p-2 flex-1" />
                <button onClick={() => removeProjectBullet(i, bIndex)} className="bg-red-500 text-white p-2 ml-2">Remove</button>
              </div>
            ))}
            <button onClick={() => addProjectBullet(i)} className="bg-blue-500 text-white p-2 mb-2">Add Bullet</button>
            <button onClick={() => removeProject(i)} className="bg-red-500 text-white p-2">Remove Project</button>
          </div>
        ))}
        <button onClick={addProject} className="bg-green-500 text-white p-2">Add Project</button>
      </section>

      {/* Technical Skills */}
      <section id="skills">
        <h2 className="text-2xl font-bold mb-4">Technical Skills</h2>
        {skillTypes.map(({ key, label }) => (
          <div key={key} className="mb-2">
            <div className="font-semibold mb-1">{label}</div>
            {resumeData.skills.filter(s => s.type === key).map((skill, i) => (
              <div key={i} className="flex mb-2">
                <input type="text" value={skill.name} onChange={e => updateSkill(resumeData.skills.findIndex((s, idx) => s.type === key && idx === i), e.target.value)} className="border p-2 flex-1" />
                <button onClick={() => removeSkill(resumeData.skills.findIndex((s, idx) => s.type === key && idx === i))} className="bg-red-500 text-white p-2 ml-2">Remove</button>
              </div>
            ))}
            <button onClick={() => addSkill(key)} className="bg-green-500 text-white p-2">Add {label.slice(0, -1)}</button>
          </div>
        ))}
      </section>

      {/* Certificates */}
      <section id="certifications">
        <h2 className="text-2xl font-bold mb-4">Certificates</h2>
        {resumeData.certifications.map((cert, i) => (
          <div key={i} className="mb-4 border p-4 rounded">
            <input type="text" placeholder="Certificate Name" value={cert.name} onChange={e => handleChange('certifications', 'name', e.target.value, i)} className="border p-2 mb-2 w-full" />
            <input type="text" placeholder="Issuer" value={cert.issuer} onChange={e => handleChange('certifications', 'issuer', e.target.value, i)} className="border p-2 mb-2 w-full" />
            <input type="text" placeholder="Year" value={cert.year} onChange={e => handleChange('certifications', 'year', e.target.value, i)} className="border p-2 mb-2 w-full" />
            <input type="text" placeholder="Certificate Link (optional)" value={cert.link || ''} onChange={e => handleChange('certifications', 'link', e.target.value, i)} className="border p-2 mb-2 w-full" />
            <button onClick={() => removeCertificate(i)} className="bg-red-500 text-white p-2">Remove Certificate</button>
          </div>
        ))}
        <button onClick={addCertificate} className="bg-green-500 text-white p-2">Add Certificate</button>
      </section>
    </div>
  );
}

export default ResumeEditor; 