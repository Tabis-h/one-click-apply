import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiEdit2, FiUpload, FiUser, FiMail, FiBriefcase, FiBookOpen, FiAward, FiFileText, FiLink, FiCheckCircle, FiAlertCircle, FiChevronDown, FiLogOut } from 'react-icons/fi';

const ProfilePage = () => {
  const [user, authLoading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('summary');
  const [editModal, setEditModal] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const [degreeOptions, setDegreeOptions] = useState([]);
  const [majorOptions, setMajorOptions] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        } catch (error) {
          setLoading(false);
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

  useEffect(() => {
    fetchDropdownOptions('degrees').then(setDegreeOptions).catch(() => setDegreeOptions([]));
    fetchDropdownOptions('majors').then(setMajorOptions).catch(() => setMajorOptions([]));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const initials = userProfile ? `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase() : '';

  // Profile strength calculation (same logic)
  const profileStrength = (() => {
    let score = 0;
    if (userProfile?.firstName && userProfile?.lastName && userProfile?.email) score += 10;
    if (userProfile?.education) score += 10;
    if (userProfile?.skills && userProfile.skills.length > 0) score += 10;
    if (userProfile?.resumeURL) score += 10;
    if (userProfile?.jobRoles && userProfile.jobRoles.length > 0) score += 10;
    if (userProfile?.projects && userProfile.projects.length > 0) score += 10;
    if (userProfile?.industries && userProfile.industries.length > 0) score += 10;
    if (userProfile?.languages && userProfile.languages.length > 0) score += 10;
    if (userProfile?.visibleToRecruiters) score += 10;
    if (userProfile?.location) score += 10;
    return score;
  })();

  if (loading || authLoading) return <LoadingSpinner />;
  if (!userProfile) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Profile not found</div>;

  // Sidebar navigation sections
  const sections = [
    { key: 'summary', label: 'Profile Summary', icon: <FiUser /> },
    { key: 'experience', label: 'Experience', icon: <FiBriefcase /> },
    { key: 'education', label: 'Education', icon: <FiBookOpen /> },
    { key: 'skills', label: 'Skills', icon: <FiAward /> },
    { key: 'projects', label: 'Projects', icon: <FiFileText /> },
    { key: 'resume', label: 'Resume', icon: <FiUpload /> },
    { key: 'links', label: 'Social Links', icon: <FiLink /> },
  ];

  // Section renderers
  const handleGenerateResume = () => {
    // Placeholder: implement resume generation modal/logic here
    alert('Resume generation coming soon!');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'summary':
        return <SummarySection userProfile={userProfile} onEdit={() => openEdit('summary', {
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          location: userProfile.location || '',
        })} onGenerateResume={handleGenerateResume} />;
      case 'experience':
        return <ExperienceSection userProfile={userProfile} onEdit={() => openEdit('experience', {
          companyName: userProfile.companyName || '',
          position: userProfile.position || '',
          startDate: userProfile.startDate || '',
          endDate: userProfile.endDate || '',
          description: userProfile.description || '',
        })} />;
      case 'education':
        return <EducationSection userProfile={userProfile} onEdit={() => openEdit('education', {
          schoolName: userProfile.schoolName || '',
          degree: userProfile.degree || '',
          fieldOfStudy: userProfile.fieldOfStudy || '',
          gpa: userProfile.gpa || '',
          startMonth: userProfile.startMonth || '',
          startYear: userProfile.startYear || '',
          endMonth: userProfile.endMonth || '',
          endYear: userProfile.endYear || '',
          description: userProfile.description || '',
        })} degreeOptions={degreeOptions} majorOptions={majorOptions} />;
      case 'skills':
        return <SkillsSection userProfile={userProfile} onEdit={() => openEdit('skills', {
          skills: Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : userProfile.skills || '',
        })} />;
      case 'projects':
        return <ProjectsSection userProfile={userProfile} onEdit={() => openEdit('projects', {
          projectName: userProfile.projectName || '',
          description: userProfile.description || '',
          startDate: userProfile.startDate || '',
          endDate: userProfile.endDate || '',
          technologies: userProfile.technologies || '',
        })} />;
      case 'resume':
        return <ResumeSection userProfile={userProfile} resumeFile={resumeFile} setResumeFile={setResumeFile} uploading={uploading} setUploading={setUploading} user={user} setUserProfile={setUserProfile} showToast={showToast} />;
      case 'links':
        return <LinksSection userProfile={userProfile} onEdit={() => openEdit('links', {
          portfolio: userProfile.portfolio || '',
          linkedin: userProfile.linkedin || '',
          github: userProfile.github || '',
          otherLink: userProfile.otherLink || '',
        })} />;
      default:
        return null;
    }
  };

  // Edit modal logic
  const openEdit = (section, values) => {
    setEditModal(section);
    setEditValues(values);
  };
  const closeEdit = () => {
    setEditModal(null);
    setEditValues({});
  };
  const handleEditSave = async () => {
    let updateData = { ...editValues, updatedAt: new Date() };
    // Ensure skills is always stored as an array
    if (editModal === 'skills' && typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    await updateDoc(doc(db, 'users', user.uid), updateData);
    setUserProfile(prev => ({ ...prev, ...updateData }));
    closeEdit();
    showToast('Profile updated!');
  };

  // Profile completion tips
  const completionTips = [
    { label: 'Add your education', done: !!userProfile.education },
    { label: 'Add your skills', done: userProfile.skills && userProfile.skills.length > 0 },
    { label: 'Upload your resume', done: !!userProfile.resumeURL },
    { label: 'Add work experience', done: !!userProfile.companyName },
    { label: 'Add a project', done: !!userProfile.projectName },
    { label: 'Add social links', done: !!userProfile.linkedin || !!userProfile.github },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-lg flex flex-col py-8 px-6 border-r min-h-screen">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 mb-2">{initials}</div>
          <div className="font-semibold text-xl">{userProfile.firstName} {userProfile.lastName}</div>
          <div className="text-gray-500 text-sm">{userProfile.email}</div>
          <div className="text-gray-400 text-xs">{userProfile.location || '-'}</div>
        </div>
        <nav className="flex flex-col gap-1 mt-4">
          {sections.map(section => (
            <button
              key={section.key}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-base w-full text-left ${activeSection === section.key ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
              onClick={() => setActiveSection(section.key)}
            >
              <span className="text-lg">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-2">
          <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 text-xs mt-8"><FiLogOut /> Logout</button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col px-0 md:px-12 py-10">
        {/* Profile Strength Bar */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">Profile Completion</span>
            <span className="text-sm font-semibold text-indigo-700">{profileStrength}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-3 bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${profileStrength}%` }}></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {completionTips.map((tip, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${tip.done ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>{tip.label}</span>
            ))}
          </div>
        </div>
        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative flex flex-col max-h-[90vh]" initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={closeEdit}>&times;</button>
              <h2 className="text-xl font-bold mb-4 capitalize px-8 pt-8">Edit {editModal}</h2>
              <div className="flex-1 overflow-y-auto px-8 pb-4">
                {editModal === 'education' ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                        <input type="text" className="w-full border rounded px-3 py-2" value={editValues.schoolName || ''} onChange={e => setEditValues(v => ({ ...v, schoolName: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <select className="w-full border rounded px-3 py-2" value={editValues.degree || ''} onChange={e => setEditValues(v => ({ ...v, degree: e.target.value }))}>
                            <option value="">Select degree</option>
                            {degreeOptions.map((deg, i) => <option key={i} value={deg}>{deg}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                          <select className="w-full border rounded px-3 py-2" value={editValues.fieldOfStudy || ''} onChange={e => setEditValues(v => ({ ...v, fieldOfStudy: e.target.value }))}>
                            <option value="">Select major</option>
                            {majorOptions.map((maj, i) => <option key={i} value={maj}>{maj}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                        <input type="text" className="w-full border rounded px-3 py-2" value={editValues.gpa || ''} onChange={e => setEditValues(v => ({ ...v, gpa: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Month</label>
                          <input type="text" className="w-full border rounded px-3 py-2" value={editValues.startMonth || ''} onChange={e => setEditValues(v => ({ ...v, startMonth: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                          <input type="text" className="w-full border rounded px-3 py-2" value={editValues.startYear || ''} onChange={e => setEditValues(v => ({ ...v, startYear: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Month</label>
                          <input type="text" className="w-full border rounded px-3 py-2" value={editValues.endMonth || ''} onChange={e => setEditValues(v => ({ ...v, endMonth: e.target.value }))} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                          <input type="text" className="w-full border rounded px-3 py-2" value={editValues.endYear || ''} onChange={e => setEditValues(v => ({ ...v, endYear: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea className="w-full border rounded px-3 py-2" value={editValues.description || ''} onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {Object.keys(editValues).map(key => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2"
                          value={editValues[key]}
                          onChange={e => setEditValues(v => ({ ...v, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 left-0 w-full bg-white px-8 py-4 border-t flex justify-end gap-2 rounded-b-xl z-10">
                <button onClick={closeEdit} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                <button onClick={handleEditSave} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{toast.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}<span>{toast.message}</span></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Section Components ---
const SummarySection = ({ userProfile, onEdit, onGenerateResume }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-6">
    <div className="flex items-center justify-between mb-2">
      <div className="text-xl font-bold">Profile Summary</div>
      <button onClick={onEdit} className="p-2 rounded hover:bg-gray-100"><FiEdit2 /></button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div><span className="font-semibold">Full Name:</span> {userProfile.firstName} {userProfile.lastName}</div>
      <div><span className="font-semibold">Email:</span> {userProfile.email}</div>
      <div><span className="font-semibold">Phone:</span> {userProfile.phone || '-'}</div>
      <div><span className="font-semibold">Location:</span> {userProfile.location || '-'}</div>
    </div>
    <div className="mt-6 flex justify-end">
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        onClick={onGenerateResume}
      >
        Generate Resume
      </button>
    </div>
  </div>
);

const ExperienceSection = ({ userProfile, onEdit }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-6">
    <div className="flex items-center justify-between mb-2">
      <div className="text-xl font-bold">Experience</div>
      <button onClick={onEdit} className="p-2 rounded hover:bg-gray-100"><FiEdit2 /></button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div><span className="font-semibold">Company:</span> {userProfile.companyName || '-'}</div>
      <div><span className="font-semibold">Position:</span> {userProfile.position || '-'}</div>
      <div><span className="font-semibold">Start Date:</span> {userProfile.startDate || '-'}</div>
      <div><span className="font-semibold">End Date:</span> {userProfile.endDate || '-'}</div>
      <div className="md:col-span-2"><span className="font-semibold">Description:</span> {userProfile.description || '-'}</div>
    </div>
  </div>
);

const EducationSection = ({ userProfile, onEdit, degreeOptions, majorOptions }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-6">
    <div className="flex items-center justify-between mb-2">
      <div className="text-xl font-bold">Education</div>
      <button onClick={onEdit} className="p-2 rounded hover:bg-gray-100"><FiEdit2 /></button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div><span className="font-semibold">School:</span> {userProfile.schoolName || '-'}</div>
      <div><span className="font-semibold">Degree:</span> {userProfile.degree || '-'}</div>
      <div><span className="font-semibold">Major:</span> {userProfile.fieldOfStudy || '-'}</div>
      <div><span className="font-semibold">GPA:</span> {userProfile.gpa || '-'}</div>
      <div><span className="font-semibold">Start:</span> {userProfile.startMonth || ''} {userProfile.startYear || ''}</div>
      <div><span className="font-semibold">End:</span> {userProfile.endMonth || ''} {userProfile.endYear || ''}</div>
      <div className="md:col-span-2"><span className="font-semibold">Description:</span> {userProfile.description || '-'}</div>
    </div>
  </div>
);

const SkillsSection = ({ userProfile, onEdit }) => {
  const skillsArr = Array.isArray(userProfile.skills)
    ? userProfile.skills
    : typeof userProfile.skills === 'string'
      ? userProfile.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xl font-bold">Skills</div>
        <button onClick={onEdit} className="p-2 rounded hover:bg-gray-100"><FiEdit2 /></button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {skillsArr.length > 0 ? (
          skillsArr.map((skill, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200">{typeof skill === 'string' ? skill : skill.name}</span>
          ))
        ) : (
          <span className="text-gray-400">No skills added</span>
        )}
      </div>
    </div>
  );
};

const ProjectsSection = ({ userProfile, onEdit }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-6">
    <div className="flex items-center justify-between mb-2">
      <div className="text-xl font-bold">Projects</div>
      <button onClick={onEdit} className="p-2 rounded hover:bg-gray-100"><FiEdit2 /></button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div><span className="font-semibold">Project Name:</span> {userProfile.projectName || '-'}</div>
      <div><span className="font-semibold">Description:</span> {userProfile.description || '-'}</div>
      <div><span className="font-semibold">Start Date:</span> {userProfile.startDate || '-'}</div>
      <div><span className="font-semibold">End Date:</span> {userProfile.endDate || '-'}</div>
      <div className="md:col-span-2"><span className="font-semibold">Technologies:</span> {userProfile.technologies || '-'}</div>
    </div>
  </div>
);

const ResumeSection = ({ userProfile, resumeFile, setResumeFile, uploading, setUploading, user, setUserProfile, showToast }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-6">
    <div className="flex items-center justify-between mb-2">
      <div className="text-xl font-bold">Resume</div>
      <label htmlFor="resume-upload" className="p-2 rounded hover:bg-gray-100 cursor-pointer"><FiUpload /></label>
      <input id="resume-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} />
    </div>
    {userProfile.resumeURL ? (
      <div className="flex items-center gap-4">
        <a href={userProfile.resumeURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline"><FiFileText /> {userProfile.resumeFilename || 'resume.pdf'}</a>
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Default</span>
        <span className="text-xs text-gray-500">Last uploaded: {userProfile.resumeLastUpdated ? new Date(userProfile.resumeLastUpdated?.toDate?.() || userProfile.resumeLastUpdated).toLocaleString() : '-'}</span>
      </div>
    ) : (
      <div className="text-gray-400">No resume uploaded</div>
    )}
    {resumeFile && (
      <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
        <span className="text-sm text-blue-800">Ready to upload: {resumeFile.name}</span>
        <div className="flex gap-2">
          <button onClick={() => setResumeFile(null)} className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={async () => { setUploading(true); try { const storageRef = ref(storage, `resumes/${user.uid}/${resumeFile.name}`); await uploadBytes(storageRef, resumeFile); const downloadURL = await getDownloadURL(storageRef); const userDocRef = doc(db, 'users', user.uid); await updateDoc(userDocRef, { resumeURL: downloadURL, resumeFilename: resumeFile.name, resumeLastUpdated: new Date() }); setUserProfile(prev => ({ ...prev, resumeURL: downloadURL, resumeFilename: resumeFile.name, resumeLastUpdated: new Date() })); setResumeFile(null); showToast('Resume uploaded successfully!'); } catch (error) { showToast('Error uploading resume', 'error'); } setUploading(false); }} disabled={uploading} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
        </div>
      </div>
    )}
  </div>
);

const LinksSection = ({ userProfile, onEdit }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-6">
    <div className="flex items-center justify-between mb-2">
      <div className="text-xl font-bold">Social Links</div>
      <button onClick={onEdit} className="p-2 rounded hover:bg-gray-100"><FiEdit2 /></button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div><span className="font-semibold">Portfolio:</span> {userProfile.portfolio ? <a href={userProfile.portfolio} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{userProfile.portfolio}</a> : '-'}</div>
      <div><span className="font-semibold">LinkedIn:</span> {userProfile.linkedin ? <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{userProfile.linkedin}</a> : '-'}</div>
      <div><span className="font-semibold">GitHub:</span> {userProfile.github ? <a href={userProfile.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">{userProfile.github}</a> : '-'}</div>
      <div><span className="font-semibold">Other:</span> {userProfile.otherLink ? <a href={userProfile.otherLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{userProfile.otherLink}</a> : '-'}</div>
    </div>
  </div>
);

const fetchDropdownOptions = async (dropdownName) => {
  const docRef = doc(db, 'meta', dropdownName);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().options;
  }
  return [];
};

export default ProfilePage;