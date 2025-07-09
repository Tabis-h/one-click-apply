import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiUser, FiEdit, FiSave, FiUpload, FiFileText, FiBriefcase, FiPlus, FiEye, FiArrowRight, FiBarChart2, FiToggleLeft, FiToggleRight, FiX, FiTrash2, FiCalendar, FiMapPin, FiMail, FiPhone, FiLinkedin, FiGithub, FiGlobe, FiCheck, FiAlertCircle, FiHeart, FiExternalLink, FiBookOpen, FiAward, FiLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const [user, authLoading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToRecruiters, setShowToRecruiters] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState({});
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
            const profileData = docSnap.data();
            setUserProfile(profileData);
            setShowToRecruiters(profileData?.visibleToRecruiters || false);
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
    fetchDropdownOptions("degrees").then(setDegreeOptions).catch(() => setDegreeOptions([]));
    fetchDropdownOptions("majors").then(setMajorOptions).catch(() => setMajorOptions([]));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const initials = userProfile ? `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase() : '';

  // Profile strength calculation (example logic)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{toast.type === 'success' ? <FiCheck /> : <FiAlertCircle />}<span>{toast.message}</span></motion.div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1 bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-xl bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 mb-4">{initials}</div>
          <h2 className="text-xl font-bold text-center mb-1">{userProfile.firstName} {userProfile.lastName}</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">Actively looking</span>
          <div className="w-full border-b my-4" />
          <nav className="w-full space-y-2">
            <button onClick={() => setActiveSection('profile')} className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${activeSection === 'profile' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}><FiUser /> Profile</button>
            <button onClick={() => setActiveSection('personal')} className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${activeSection === 'personal' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}><FiMail /> Personal Info</button>
            <button onClick={() => setActiveSection('preferences')} className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${activeSection === 'preferences' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}><FiBriefcase /> Job Preferences</button>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="md:col-span-2 space-y-8">
          {/* Profile Strength always visible */}
          <section className="bg-white rounded-xl shadow p-6 mb-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">My Profile Strength <FiBarChart2 /></h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-3 bg-indigo-500 rounded-full" style={{ width: `${profileStrength}%` }}></div>
              </div>
              <span className="text-sm font-semibold text-indigo-700">{profileStrength}%</span>
            </div>
            <ul className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
              <li className={userProfile.firstName && userProfile.lastName && userProfile.email ? 'line-through text-gray-400' : ''}>Add your contact info +10%</li>
              <li className={userProfile.education ? 'line-through text-gray-400' : ''}>Add your education journey +10%</li>
              <li className={userProfile.skills && userProfile.skills.length > 0 ? 'line-through text-gray-400' : ''}>Add your skills +10%</li>
              <li className={userProfile.resumeURL ? 'line-through text-gray-400' : ''}>Add your resume +10%</li>
              <li className={userProfile.jobRoles && userProfile.jobRoles.length > 0 ? 'line-through text-gray-400' : ''}>Fill out your job preferences +10%</li>
              <li className={userProfile.projects && userProfile.projects.length > 0 ? 'line-through text-gray-400' : ''}>Add your projects +10%</li>
              <li className={userProfile.industries && userProfile.industries.length > 0 ? 'line-through text-gray-400' : ''}>Add your industries +10%</li>
              <li className={userProfile.languages && userProfile.languages.length > 0 ? 'line-through text-gray-400' : ''}>Add your languages +10%</li>
              <li className={userProfile.visibleToRecruiters ? 'line-through text-gray-400' : ''}>Show profile to recruiters +10%</li>
              <li className={userProfile.location ? 'line-through text-gray-400' : ''}>Add your location +10%</li>
            </ul>
          </section>

          {/* Only show cards for the selected section */}
          {activeSection === 'profile' && (
            <>
              {/* Profile Info Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Profile Information <FiUser /></h3>
                  <button onClick={() => { setEditingField('profile'); setEditValue({
                    firstName: userProfile.firstName || '',
                    lastName: userProfile.lastName || '',
                    email: userProfile.email || '',
                    phone: userProfile.phone || '',
                    location: userProfile.location || ''
                  }); }} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2"><span className="font-semibold">Full Name:</span> {userProfile.firstName} {userProfile.lastName}</div>
                    <div className="mb-2"><span className="font-semibold">Email:</span> {userProfile.email}</div>
                    <div className="mb-2"><span className="font-semibold">Phone:</span> {userProfile.phone || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Location:</span> {userProfile.location || '-'}</div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-semibold">Job Roles:</span> {userProfile.jobRoles?.join(', ') || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Industries:</span> {userProfile.industries?.join(', ') || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Languages:</span> {userProfile.languages?.join(', ') || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Experience:</span> {userProfile.experience || '-'} ({userProfile.experienceYears || 0} yrs)</div>
                  </div>
                </div>
                {/* Edit Modal for Profile Info */}
                {editingField === 'profile' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Profile Information</h3>
                      <div className="space-y-3">
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="First Name" value={editValue.firstName} onChange={e => setEditValue(v => ({ ...v, firstName: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Last Name" value={editValue.lastName} onChange={e => setEditValue(v => ({ ...v, lastName: e.target.value }))} />
                        <input type="email" className="w-full border rounded px-3 py-2" placeholder="Email" value={editValue.email} onChange={e => setEditValue(v => ({ ...v, email: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Phone" value={editValue.phone} onChange={e => setEditValue(v => ({ ...v, phone: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Location" value={editValue.location} onChange={e => setEditValue(v => ({ ...v, location: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            firstName: editValue.firstName,
                            lastName: editValue.lastName,
                            email: editValue.email,
                            phone: editValue.phone,
                            location: editValue.location,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, ...editValue }));
                          setEditingField(null);
                          showToast('Profile updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* Resume Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Resume <FiFileText /></h3>
                  <button onClick={() => document.getElementById('resume-upload').click()} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                {userProfile.resumeURL ? (
                  <div className="flex items-center gap-4">
                    <a href={userProfile.resumeURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline"><FiFileText /> {userProfile.resumeFilename || 'resume.pdf'}</a>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Default</span>
                    <span className="text-xs text-gray-500">Last uploaded: {userProfile.resumeLastUpdated ? new Date(userProfile.resumeLastUpdated?.toDate?.() || userProfile.resumeLastUpdated).toLocaleString() : '-'}</span>
                  </div>
                ) : (
                  <div className="text-gray-500">No resume uploaded</div>
                )}
                <input id="resume-upload" type="file" onChange={(e) => setResumeFile(e.target.files[0])} className="hidden" accept=".pdf,.doc,.docx" />
                {resumeFile && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-blue-800">Ready to upload: {resumeFile.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setResumeFile(null)} className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800">Cancel</button>
                      <button onClick={async () => { setUploading(true); try { const storageRef = ref(storage, `resumes/${user.uid}/${resumeFile.name}`); await uploadBytes(storageRef, resumeFile); const downloadURL = await getDownloadURL(storageRef); const userDocRef = doc(db, 'users', user.uid); await updateDoc(userDocRef, { resumeURL: downloadURL, resumeFilename: resumeFile.name, resumeLastUpdated: new Date() }); setUserProfile(prev => ({ ...prev, resumeURL: downloadURL, resumeFilename: resumeFile.name, resumeLastUpdated: new Date() })); setResumeFile(null); showToast('Resume uploaded successfully!'); } catch (error) { showToast('Error uploading resume', 'error'); } setUploading(false); }} disabled={uploading} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
                    </div>
                  </div>
                )}
              </section>
              {/* Work Experience Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Work Experience <FiBriefcase /></h3>
                  <button onClick={() => { setEditingField('workExperience'); setEditValue({
                    companyName: userProfile.companyName || '',
                    position: userProfile.position || '',
                    startDate: userProfile.startDate || '',
                    endDate: userProfile.endDate || '',
                    description: userProfile.description || ''
                  }); }} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2"><span className="font-semibold">Company Name:</span> {userProfile.companyName || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Position:</span> {userProfile.position || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Start Date:</span> {userProfile.startDate || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">End Date:</span> {userProfile.endDate || '-'}</div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-semibold">Description:</span> {userProfile.description || '-'}</div>
                  </div>
                </div>
                {editingField === 'workExperience' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Work Experience</h3>
                      <div className="space-y-3">
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Company Name" value={editValue.companyName} onChange={e => setEditValue(v => ({ ...v, companyName: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Position" value={editValue.position} onChange={e => setEditValue(v => ({ ...v, position: e.target.value }))} />
                        <input type="date" className="w-full border rounded px-3 py-2" value={editValue.startDate} onChange={e => setEditValue(v => ({ ...v, startDate: e.target.value }))} />
                        <input type="date" className="w-full border rounded px-3 py-2" value={editValue.endDate} onChange={e => setEditValue(v => ({ ...v, endDate: e.target.value }))} />
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Description" value={editValue.description} onChange={e => setEditValue(v => ({ ...v, description: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            companyName: editValue.companyName,
                            position: editValue.position,
                            startDate: editValue.startDate,
                            endDate: editValue.endDate,
                            description: editValue.description,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, ...editValue }));
                          setEditingField(null);
                          showToast('Work experience updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* Education Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Education <FiBookOpen /></h3>
                  <button onClick={() => { setEditingField('education'); setEditValue({
                    schoolName: userProfile.schoolName || '',
                    degree: userProfile.degree || '',
                    fieldOfStudy: userProfile.fieldOfStudy || '',
                    startDate: userProfile.startDate || '',
                    endDate: userProfile.endDate || '',
                    description: userProfile.description || ''
                  }); }} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2"><span className="font-semibold">School Name:</span> {userProfile.schoolName || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Degree:</span> {userProfile.degree || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Field of Study:</span> {userProfile.fieldOfStudy || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Start Date:</span> {userProfile.startDate || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">End Date:</span> {userProfile.endDate || '-'}</div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-semibold">Description:</span> {userProfile.description || '-'}</div>
                  </div>
                </div>
                {editingField === 'education' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Education</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2"
                          placeholder="School Name"
                          value={editValue.schoolName}
                          onChange={e => setEditValue(v => ({ ...v, schoolName: e.target.value }))}
                        />
                        {/* Degree Dropdown */}
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={editValue.degree}
                          onChange={e => setEditValue(v => ({ ...v, degree: e.target.value }))}
                        >
                          <option value="">Select Degree</option>
                          {(degreeOptions || []).map((deg, i) => (
                            <option key={i} value={deg}>{deg}</option>
                          ))}
                        </select>
                        {/* Major Dropdown */}
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={editValue.fieldOfStudy}
                          onChange={e => setEditValue(v => ({ ...v, fieldOfStudy: e.target.value }))}
                        >
                          <option value="">Select Major</option>
                          {(majorOptions || []).map((maj, i) => (
                            <option key={i} value={maj}>{maj}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          className="w-full border rounded px-3 py-2"
                          value={editValue.startDate}
                          onChange={e => setEditValue(v => ({ ...v, startDate: e.target.value }))}
                        />
                        <input
                          type="date"
                          className="w-full border rounded px-3 py-2"
                          value={editValue.endDate}
                          onChange={e => setEditValue(v => ({ ...v, endDate: e.target.value }))}
                        />
                        <textarea
                          className="w-full border rounded px-3 py-2"
                          placeholder="Description"
                          value={editValue.description}
                          onChange={e => setEditValue(v => ({ ...v, description: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button
                          onClick={async () => {
                            await updateDoc(doc(db, 'users', user.uid), {
                              schoolName: editValue.schoolName,
                              degree: editValue.degree,
                              fieldOfStudy: editValue.fieldOfStudy,
                              startDate: editValue.startDate,
                              endDate: editValue.endDate,
                              description: editValue.description,
                              updatedAt: new Date()
                            });
                            setUserProfile(prev => ({ ...prev, ...editValue }));
                            setEditingField(null);
                            showToast('Education updated!');
                          }}
                          className="px-4 py-2 rounded bg-indigo-600 text-white"
                        >Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* Projects & Outside Experience Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Projects & Outside Experience <FiAward /></h3>
                  <button onClick={() => { setEditingField('projects'); setEditValue({
                    projectName: userProfile.projectName || '',
                    description: userProfile.description || '',
                    startDate: userProfile.startDate || '',
                    endDate: userProfile.endDate || '',
                    technologies: userProfile.technologies || ''
                  }); }} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2"><span className="font-semibold">Project Name:</span> {userProfile.projectName || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Description:</span> {userProfile.description || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Start Date:</span> {userProfile.startDate || '-'}</div>
                    <div className="mb-2"><span className="font-semibold">End Date:</span> {userProfile.endDate || '-'}</div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-semibold">Technologies:</span> {userProfile.technologies || '-'}</div>
                  </div>
                </div>
                {editingField === 'projects' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Project</h3>
                      <div className="space-y-3">
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Project Name" value={editValue.projectName} onChange={e => setEditValue(v => ({ ...v, projectName: e.target.value }))} />
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Description" value={editValue.description} onChange={e => setEditValue(v => ({ ...v, description: e.target.value }))} />
                        <input type="date" className="w-full border rounded px-3 py-2" value={editValue.startDate} onChange={e => setEditValue(v => ({ ...v, startDate: e.target.value }))} />
                        <input type="date" className="w-full border rounded px-3 py-2" value={editValue.endDate} onChange={e => setEditValue(v => ({ ...v, endDate: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Technologies (comma-separated)" value={editValue.technologies} onChange={e => setEditValue(v => ({ ...v, technologies: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            projectName: editValue.projectName,
                            description: editValue.description,
                            startDate: editValue.startDate,
                            endDate: editValue.endDate,
                            technologies: editValue.technologies,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, ...editValue }));
                          setEditingField(null);
                          showToast('Project updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* Portfolio & Links Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Portfolio & Links <FiLink /></h3>
                  <button onClick={() => { setEditingField('portfolioLinks'); setEditValue({
                    portfolio: userProfile.portfolio || '',
                    linkedin: userProfile.linkedin || '',
                    github: userProfile.github || '',
                    otherLink: userProfile.otherLink || ''
                  }); }} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2"><span className="font-semibold">Portfolio:</span> {userProfile.portfolio ? <a href={userProfile.portfolio} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{userProfile.portfolio}</a> : '-'}</div>
                    <div className="mb-2"><span className="font-semibold">LinkedIn:</span> {userProfile.linkedin ? <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{userProfile.linkedin}</a> : '-'}</div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-semibold">GitHub:</span> {userProfile.github ? <a href={userProfile.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">{userProfile.github}</a> : '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Other:</span> {userProfile.otherLink ? <a href={userProfile.otherLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{userProfile.otherLink}</a> : '-'}</div>
                  </div>
                </div>
                {editingField === 'portfolioLinks' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Portfolio & Links</h3>
                      <div className="space-y-3">
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Portfolio URL" value={editValue.portfolio} onChange={e => setEditValue(v => ({ ...v, portfolio: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="LinkedIn URL" value={editValue.linkedin} onChange={e => setEditValue(v => ({ ...v, linkedin: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="GitHub URL" value={editValue.github} onChange={e => setEditValue(v => ({ ...v, github: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Other Link (e.g., personal website)" value={editValue.otherLink} onChange={e => setEditValue(v => ({ ...v, otherLink: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            portfolio: editValue.portfolio,
                            linkedin: editValue.linkedin,
                            github: editValue.github,
                            otherLink: editValue.otherLink,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, ...editValue }));
                          setEditingField(null);
                          showToast('Portfolio & Links updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* Skills Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Skills <FiAward /></h3>
                  <button onClick={() => { setEditingField('skills'); setEditValue({
                    skills: userProfile.skills || ''
                  }); }} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Skills that you'd prefer to utilize in roles are highlighted with a heart <FiHeart className="inline text-red-400" /></p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills && userProfile.skills.length > 0 ? (
                    userProfile.skills.map((skill, i) => (
                      <span key={i} className={`px-3 py-1 rounded-full flex items-center gap-1 text-xs ${skill.preferred ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-gray-100 text-gray-800'}`}>
                        {typeof skill === 'string' ? skill : skill.name}
                        {skill.preferred && <FiHeart size={12} className="text-red-500" />}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No skills added</span>
                  )}
                </div>
                {editingField === 'skills' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Skills</h3>
                      <div className="space-y-3">
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Skills (comma-separated, e.g., React, Node.js, Python)" value={editValue.skills} onChange={e => setEditValue(v => ({ ...v, skills: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            skills: editValue.skills,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, skills: editValue.skills }));
                          setEditingField(null);
                          showToast('Skills updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* Languages Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Languages <FiGlobe /></h3>
                  <button onClick={() => { setEditingField('languages'); setEditValue({
                    languages: userProfile.languages || ''
                  }); }} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.languages && userProfile.languages.length > 0 ? (
                    userProfile.languages.map((lang, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">{lang}</span>
                    ))
                  ) : (
                    <span className="text-gray-500">No languages added</span>
                  )}
                </div>
                {editingField === 'languages' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Languages</h3>
                      <div className="space-y-3">
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Languages (comma-separated, e.g., English, Spanish, French)" value={editValue.languages} onChange={e => setEditValue(v => ({ ...v, languages: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            languages: editValue.languages,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, languages: editValue.languages }));
                          setEditingField(null);
                          showToast('Languages updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
          {activeSection === 'personal' && (
            <>
              {/* Personal Info Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Personal Information <FiUser /></h3>
                  <button onClick={() => { setEditingField('personalInfo'); setEditValue({
                    linkedin: userProfile.linkedin || '',
                    github: userProfile.github || '',
                    portfolio: userProfile.portfolio || '',
                    otherLink: userProfile.otherLink || ''
                  }); }} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2"><span className="font-semibold">LinkedIn:</span> {userProfile.linkedin ? <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{userProfile.linkedin}</a> : '-'}</div>
                    <div className="mb-2"><span className="font-semibold">GitHub:</span> {userProfile.github ? <a href={userProfile.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline">{userProfile.github}</a> : '-'}</div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-semibold">Portfolio:</span> {userProfile.portfolio ? <a href={userProfile.portfolio} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{userProfile.portfolio}</a> : '-'}</div>
                    <div className="mb-2"><span className="font-semibold">Other:</span> {userProfile.otherLink ? <a href={userProfile.otherLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{userProfile.otherLink}</a> : '-'}</div>
                  </div>
                </div>
                {editingField === 'personalInfo' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Personal Information</h3>
                      <div className="space-y-3">
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="LinkedIn URL" value={editValue.linkedin} onChange={e => setEditValue(v => ({ ...v, linkedin: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="GitHub URL" value={editValue.github} onChange={e => setEditValue(v => ({ ...v, github: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Portfolio URL" value={editValue.portfolio} onChange={e => setEditValue(v => ({ ...v, portfolio: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Other Link (e.g., personal website)" value={editValue.otherLink} onChange={e => setEditValue(v => ({ ...v, otherLink: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            linkedin: editValue.linkedin,
                            github: editValue.github,
                            portfolio: editValue.portfolio,
                            otherLink: editValue.otherLink,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, ...editValue }));
                          setEditingField(null);
                          showToast('Personal information updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* Employment Information Card */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">Employment Information <FiBriefcase /></h3>
                  <button onClick={() => { setEditingField('employmentInfo'); setEditValue({
                    ethnicity: userProfile.ethnicity || '',
                    usWorkAuth: userProfile.usWorkAuth || '',
                    canadaWorkAuth: userProfile.canadaWorkAuth || '',
                    ukWorkAuth: userProfile.ukWorkAuth || '',
                    needSponsorship: userProfile.needSponsorship || '',
                    disability: userProfile.disability || '',
                    lgbtq: userProfile.lgbtq || '',
                    gender: userProfile.gender || '',
                    veteran: userProfile.veteran || ''
                  }); }} className="p-2 rounded hover:bg-gray-100"><FiEdit /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-semibold">What is your ethnicity?</span> {userProfile.ethnicity || 'South Asian'}</div>
                  <div><span className="font-semibold">Are you authorized to work in the US?</span> {userProfile.usWorkAuth || 'No'}</div>
                  <div><span className="font-semibold">Are you authorized to work in Canada?</span> {userProfile.canadaWorkAuth || 'No'}</div>
                  <div><span className="font-semibold">Are you authorized to work in the United Kingdom?</span> {userProfile.ukWorkAuth || 'No'}</div>
                  <div><span className="font-semibold">Will you now or in the future require sponsorship for employment visa status?</span> {userProfile.needSponsorship || 'No'}</div>
                  <div><span className="font-semibold">Do you have a disability?</span> {userProfile.disability || 'No'}</div>
                  <div><span className="font-semibold">Do you identify as LGBTQ+?</span> {userProfile.lgbtq || 'No'}</div>
                  <div><span className="font-semibold">What is your gender?</span> {userProfile.gender || 'Male'}</div>
                  <div><span className="font-semibold">Are you a veteran?</span> {userProfile.veteran || 'No'}</div>
                </div>
                {editingField === 'employmentInfo' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Employment Information</h3>
                      <div className="space-y-3">
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Ethnicity" value={editValue.ethnicity} onChange={e => setEditValue(v => ({ ...v, ethnicity: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="US Work Authorization" value={editValue.usWorkAuth} onChange={e => setEditValue(v => ({ ...v, usWorkAuth: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Canada Work Authorization" value={editValue.canadaWorkAuth} onChange={e => setEditValue(v => ({ ...v, canadaWorkAuth: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="UK Work Authorization" value={editValue.ukWorkAuth} onChange={e => setEditValue(v => ({ ...v, ukWorkAuth: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Need Sponsorship" value={editValue.needSponsorship} onChange={e => setEditValue(v => ({ ...v, needSponsorship: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Disability" value={editValue.disability} onChange={e => setEditValue(v => ({ ...v, disability: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="LGBTQ+" value={editValue.lgbtq} onChange={e => setEditValue(v => ({ ...v, lgbtq: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Gender" value={editValue.gender} onChange={e => setEditValue(v => ({ ...v, gender: e.target.value }))} />
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Veteran" value={editValue.veteran} onChange={e => setEditValue(v => ({ ...v, veteran: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            ethnicity: editValue.ethnicity,
                            usWorkAuth: editValue.usWorkAuth,
                            canadaWorkAuth: editValue.canadaWorkAuth,
                            ukWorkAuth: editValue.ukWorkAuth,
                            needSponsorship: editValue.needSponsorship,
                            disability: editValue.disability,
                            lgbtq: editValue.lgbtq,
                            gender: editValue.gender,
                            veteran: editValue.veteran,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, ...editValue }));
                          setEditingField(null);
                          showToast('Employment information updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
          {activeSection === 'preferences' && (
            <>
              {/* What do you value in a new role? */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">What do you value in a new role?</h3>
                  <span className="text-xs text-gray-500">Select up to 3</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(userProfile.roleValues || ['Impactful work', 'Innovative product & tech', 'Work-life balance']).map((val, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">{val}</span>
                  ))}
                </div>
                {editingField === 'roleValues' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Role Values</h3>
                      <div className="space-y-3">
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Role Values (comma-separated, e.g., Impactful work, Innovative product & tech, Work-life balance)" value={editValue.roleValues} onChange={e => setEditValue(v => ({ ...v, roleValues: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            roleValues: editValue.roleValues,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, roleValues: editValue.roleValues }));
                          setEditingField(null);
                          showToast('Role values updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* What kinds of roles are you interested in? */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">What kinds of roles are you interested in?</h3>
                  <span className="text-xs text-gray-500">Select up to 5</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(userProfile.interestedRoles || ['AI & Machine Learning', 'DevOps & Infrastructure', 'IT & Security', 'Software Engineering']).map((role, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">{role}</span>
                  ))}
                </div>
                {editingField === 'interestedRoles' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Interested Roles</h3>
                      <div className="space-y-3">
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Interested Roles (comma-separated, e.g., AI & Machine Learning, DevOps & Infrastructure)" value={editValue.interestedRoles} onChange={e => setEditValue(v => ({ ...v, interestedRoles: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            interestedRoles: editValue.interestedRoles,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, interestedRoles: editValue.interestedRoles }));
                          setEditingField(null);
                          showToast('Interested roles updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* Where would you like to work? */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="mb-2 font-semibold">Where would you like to work?</div>
                <div>{userProfile.preferredLocation || '-'}</div>
                {editingField === 'preferredLocation' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Preferred Location</h3>
                      <div className="space-y-3">
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Preferred Location" value={editValue.preferredLocation} onChange={e => setEditValue(v => ({ ...v, preferredLocation: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            preferredLocation: editValue.preferredLocation,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, preferredLocation: editValue.preferredLocation }));
                          setEditingField(null);
                          showToast('Preferred location updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* What type of roles are you looking for? */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="mb-2 font-semibold">What type of roles are you looking for?</div>
                <div>{userProfile.roleType || '-'}</div>
                {editingField === 'roleType' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Role Type</h3>
                      <div className="space-y-3">
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Role Type" value={editValue.roleType} onChange={e => setEditValue(v => ({ ...v, roleType: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            roleType: editValue.roleType,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, roleType: editValue.roleType }));
                          setEditingField(null);
                          showToast('Role type updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* What is your ideal company size? */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="mb-2 font-semibold">What is your ideal company size?</div>
                <div>{userProfile.companySize || '-'}</div>
                {editingField === 'companySize' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Company Size</h3>
                      <div className="space-y-3">
                        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Company Size" value={editValue.companySize} onChange={e => setEditValue(v => ({ ...v, companySize: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            companySize: editValue.companySize,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, companySize: editValue.companySize }));
                          setEditingField(null);
                          showToast('Company size updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* What industries are exciting to you? */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="mb-2 font-semibold">What industries are exciting to you?</div>
                <div>{userProfile.excitingIndustries?.join(', ') || '-'}</div>
                {editingField === 'excitingIndustries' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Exciting Industries</h3>
                      <div className="space-y-3">
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Exciting Industries (comma-separated, e.g., AI, FinTech, Healthcare)" value={editValue.excitingIndustries} onChange={e => setEditValue(v => ({ ...v, excitingIndustries: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            excitingIndustries: editValue.excitingIndustries,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, excitingIndustries: editValue.excitingIndustries }));
                          setEditingField(null);
                          showToast('Exciting industries updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* Are there any industries you don't want to work in? */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="mb-2 font-semibold">Are there any industries you don't want to work in?</div>
                <div>{userProfile.avoidIndustries?.join(', ') || '-'}</div>
                {editingField === 'avoidIndustries' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Avoided Industries</h3>
                      <div className="space-y-3">
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Avoided Industries (comma-separated, e.g., Finance, Healthcare)" value={editValue.avoidIndustries} onChange={e => setEditValue(v => ({ ...v, avoidIndustries: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            avoidIndustries: editValue.avoidIndustries,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, avoidIndustries: editValue.avoidIndustries }));
                          setEditingField(null);
                          showToast('Avoided industries updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* What skills do you have or enjoy working with? */}
              <section className="bg-white rounded-xl shadow p-6">
                <div className="mb-2 font-semibold">What skills do you have or enjoy working with?</div>
                <div>{userProfile.skills?.map((skill, i) => (typeof skill === 'string' ? skill : skill.name)).join(', ') || '-'}</div>
                {editingField === 'skills' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-lg mb-4">Edit Skills</h3>
                      <div className="space-y-3">
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Skills (comma-separated, e.g., React, Node.js, Python)" value={editValue.skills} onChange={e => setEditValue(v => ({ ...v, skills: e.target.value }))} />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'users', user.uid), {
                            skills: editValue.skills,
                            updatedAt: new Date()
                          });
                          setUserProfile(prev => ({ ...prev, skills: editValue.skills }));
                          setEditingField(null);
                          showToast('Skills updated!');
                        }} className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const fetchDropdownOptions = async (dropdownName) => {
  const docRef = doc(db, "meta", dropdownName);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log(`${dropdownName} options:`, docSnap.data().options);
    return docSnap.data().options;
  }
  console.log(`${dropdownName} not found`);
  return [];
};

export default ProfilePage;