import React, { useState, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';

const defaultProfile = {
  name: 'MOHAMMAD TABISH SUBEDAR',
  phone: '+91 91130 67356',
  email: 'tabishsubedar50@gmail.com',
  location: 'Belgaum, KA, India',
  linkedin: 'linkedin.com/in/tabish-/',
  github: 'github.com/Tabis-h',
  summary: 'Computer Science graduate with expertise in android development and game development. Passionate about building scalable applications with intuitive user interfaces. Strong problem-solving skills with experience in Flutter, Unity, and database management systems. Collaborative team player with excellent documentation skills and a commitment to writing clean, maintainable code.',
  education: {
    school: 'S G Balekundri Institute of Technology',
    location: 'Belgaum, Karnataka',
    degree: 'Bachelor of Engineering in Computer Science',
    dates: 'Dec. 2021 -- May 2025',
    gpa: '7',
  },
  experience: [
    {
      title: 'AIML Intern',
      dates: 'Sep. 2023 -- Nov. 2023',
      company: 'Eyesec Cyber Security Solutions',
      location: 'Belgaum, Karnataka',
      bullets: [
        'Documented architecture and API specifications for NLP-based security.',
        'Researched and prototyped GNN models for network anomaly detection with 92% accuracy',
        'Maintained comprehensive technical documentation for team reference and onboarding',
        'Conducted code reviews and managed version control using GitHub in agile environment',
      ],
    },
  ],
  projects: [
    {
      name: 'Smart Utility Management System',
      tech: 'Flutter, Firebase, SupaBase, Node.js',
      dates: 'Nov. 2024 -- Jan. 2025',
      bullets: [
        'Developed full-stack solution connecting 500+ users with service providers through real-time task management',
        'Engineered Firebase authentication system with JWT tokens, reducing unauthorized access.',
        'Implemented image compression algorithm before Supabase storage, decreasing load times by 40%',
        'Designed RESTful API with Node.js handling 100+ concurrent requests with 200ms response time',
        'Created admin dashboard with analytics for service providers to track performance metrics',
      ],
    },
    {
      name: '3D Multiplayer Arena Shooter',
      tech: 'Unity, C#, Alteruna, Blender',
      dates: 'May 2024 -- June 2024',
      bullets: [
        'Built low-latency multiplayer architecture supporting 16 concurrent players with matchmaking system',
        'Optimized network synchronization using interpolation algorithms, reducing bandwidth by 30%',
        'Developed weapon system with 15+ customizable attributes and dynamic recoil patterns',
        'Modeled 10+ 3D assets in Blender with optimized polygon counts for mobile performance',
        'Implemented anti-cheat measures detecting speed hacks and aimbots with 85% accuracy',
      ],
    },
    {
      name: 'Driving School ERP System',
      tech: 'MySQL, PHP, HTML5, CSS3',
      dates: 'Feb. 2023 -- Apr. 2023',
      bullets: [
        'Architected relational database schema with 20+ tables handling student records, payments, and scheduling',
        'Automated license test scheduling reducing administrative workload by 60 hours/month',
        'Built reporting module generating PDF certificates and financial statements using FPDF library',
        'Implemented role-based access control with 5 permission levels for different staff members',
        'Optimized SQL queries reducing report generation time from 15s to under 2s',
      ],
    },
  ],
  skills: {
    Languages: 'Python, Java, C/C++, SQL, C#, Dart, PHP',
    Frontend: 'Flutter, HTML5, CSS3',
    Backend: 'Spring Boot, RESTful APIs',
    Databases: 'MySQL, Firebase, Supabase',
    Tools: 'Git, Docker, Unity, Blender, VS Code, PyCharm, Postman',
    Concepts: 'OOP, Data Structures, Algorithms, CI/CD, Agile',
  },
};

const sectionTitle = (title) => (
  <div className="mt-8 mb-2 flex items-center gap-2">
    <span className="uppercase font-bold tracking-widest text-lg border-b border-black flex-1">{title}</span>
  </div>
);

const ResumeBuilder = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(defaultProfile);
  const resumeRef = useRef();
  // Toggles
  const [showPhone, setShowPhone] = useState(true);
  const [showLinkedin, setShowLinkedin] = useState(true);
  const [showGithub, setShowGithub] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  // Inline edit state
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  // Inline edit helpers
  const startEdit = (field) => { setEditField(field); setEditValue(profile[field] || ''); };
  const saveEdit = () => { setProfile((prev) => ({ ...prev, [editField]: editValue })); setEditField(null); setEditValue(''); };
  // For nested fields (education, skills)
  const startEditNested = (section, key) => { setEditField(section + '.' + key); setEditValue(profile[section][key] || ''); };
  const saveEditNested = () => {
    const [section, key] = editField.split('.');
    setProfile((prev) => ({ ...prev, [section]: { ...prev[section], [key]: editValue } }));
    setEditField(null); setEditValue('');
  };
  // For experience/projects bullets
  const startEditBullet = (section, idx, bulletIdx) => {
    setEditField(`${section}.${idx}.bullets.${bulletIdx}`);
    setEditValue(profile[section][idx].bullets[bulletIdx] || '');
  };
  const saveEditBullet = () => {
    const [section, idx, , bulletIdx] = editField.split('.');
    setProfile((prev) => {
      const updated = { ...prev };
      updated[section] = [...updated[section]];
      updated[section][+idx] = { ...updated[section][+idx] };
      updated[section][+idx].bullets = [...updated[section][+idx].bullets];
      updated[section][+idx].bullets[+bulletIdx] = editValue;
      return updated;
    });
    setEditField(null); setEditValue('');
  };
  // PDF export
  const handleDownload = async () => {
    if (!resumeRef.current) return;
    const canvas = await html2canvas(resumeRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('resume.pdf');
  };
  // Inline field
  const InlineField = ({ field, className, children, textarea }) => (
    editField === field ? (
      textarea ? (
        <textarea className={className + ' border border-blue-400 rounded px-2 py-1'} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveEdit} autoFocus />
      ) : (
        <input className={className + ' border border-blue-400 rounded px-2 py-1'} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveEdit} autoFocus />
      )
    ) : (
      <span className={className + ' cursor-pointer hover:bg-blue-50 transition'} onClick={() => startEdit(field)}>{children}</span>
    )
  );
  // Inline nested
  const InlineNested = ({ section, field, className, children }) => (
    editField === section + '.' + field ? (
      <input className={className + ' border border-blue-400 rounded px-2 py-1'} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveEditNested} autoFocus />
    ) : (
      <span className={className + ' cursor-pointer hover:bg-blue-50 transition'} onClick={() => startEditNested(section, field)}>{children}</span>
    )
  );
  // Inline bullet
  const InlineBullet = ({ section, idx, bulletIdx, children }) => (
    editField === `${section}.${idx}.bullets.${bulletIdx}` ? (
      <input className="border border-blue-400 rounded px-2 py-1 w-full" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveEditBullet} autoFocus />
    ) : (
      <span className="cursor-pointer hover:bg-blue-50 transition" onClick={() => startEditBullet(section, idx, bulletIdx)}>{children}</span>
    )
  );
  // Inline skills
  const InlineSkillGroup = ({ group }) => (
    editField === 'skills.' + group ? (
      <input className="border border-blue-400 rounded px-2 py-1 w-full" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => { setProfile((prev) => ({ ...prev, skills: { ...prev.skills, [group]: editValue } })); setEditField(null); setEditValue(''); }} autoFocus />
    ) : (
      <span className="cursor-pointer hover:bg-blue-50 transition" onClick={() => { setEditField('skills.' + group); setEditValue(profile.skills[group] || ''); }}>{profile.skills[group]}</span>
    )
  );
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-2 md:px-0 flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto flex justify-between items-center mb-8">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">&larr; Back</button>
        <button onClick={handleDownload} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Download PDF</button>
      </div>
      <div className="w-full max-w-3xl mx-auto mb-6 flex flex-wrap gap-2 items-center">
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={showLocation} onChange={() => setShowLocation(v => !v)} />Show Location</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={showPhone} onChange={() => setShowPhone(v => !v)} />Show Phone</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={showLinkedin} onChange={() => setShowLinkedin(v => !v)} />Show LinkedIn</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={showGithub} onChange={() => setShowGithub(v => !v)} />Show GitHub</label>
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={showSummary} onChange={() => setShowSummary(v => !v)} />Show Summary</label>
      </div>
      <div ref={resumeRef} className="bg-white rounded-xl shadow-xl p-10 w-full max-w-3xl mx-auto print:p-0 print:shadow-none font-serif">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold tracking-wide">
            <InlineField field="name">{profile.name}</InlineField>
          </h1>
          <div className="text-xs mt-1 flex flex-wrap justify-center gap-2 text-gray-700">
            {showPhone && <span><InlineField field="phone">{profile.phone}</InlineField></span>}
            <span>|</span>
            <span><InlineField field="email">{profile.email}</InlineField></span>
            {showLocation && <><span>|</span><span><InlineField field="location">{profile.location}</InlineField></span></>}
            {showLinkedin && <><span>|</span><span><InlineField field="linkedin">{profile.linkedin}</InlineField></span></>}
            {showGithub && <><span>|</span><span><InlineField field="github">{profile.github}</InlineField></span></>}
          </div>
        </div>
        {/* Summary */}
        {showSummary && (
          <>
            {sectionTitle('Professional Summary')}
            <div className="text-xs mb-2">
              <InlineField field="summary" className="w-full" textarea>{profile.summary}</InlineField>
            </div>
          </>
        )}
        {/* Education */}
        {sectionTitle('Education')}
        <div className="text-xs mb-2">
          <div className="flex flex-wrap justify-between font-semibold">
            <span><InlineNested section="education" field="school">{profile.education.school}</InlineNested>, <InlineNested section="education" field="location">{profile.education.location}</InlineNested></span>
            <span><InlineNested section="education" field="dates">{profile.education.dates}</InlineNested></span>
          </div>
          <div className="flex flex-wrap justify-between italic">
            <span><InlineNested section="education" field="degree">{profile.education.degree}</InlineNested></span>
            <span>GPA: <InlineNested section="education" field="gpa">{profile.education.gpa}</InlineNested></span>
          </div>
        </div>
        {/* Experience */}
        {sectionTitle('Experience')}
        <div className="text-xs mb-2">
          {profile.experience.map((exp, i) => (
            <div key={i} className="mb-2">
              <div className="flex flex-wrap justify-between font-semibold">
                <span><InlineBullet section="experience" idx={i} bulletIdx={-1}>{exp.title}</InlineBullet></span>
                <span><InlineBullet section="experience" idx={i} bulletIdx={-2}>{exp.dates}</InlineBullet></span>
              </div>
              <div className="flex flex-wrap justify-between italic">
                <span><InlineBullet section="experience" idx={i} bulletIdx={-3}>{exp.company}</InlineBullet></span>
                <span><InlineBullet section="experience" idx={i} bulletIdx={-4}>{exp.location}</InlineBullet></span>
              </div>
              <ul className="list-disc ml-5 mt-1">
                {exp.bullets.map((b, j) => (
                  <li key={j}><InlineBullet section="experience" idx={i} bulletIdx={j}>{b}</InlineBullet></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Projects */}
        {sectionTitle('Projects')}
        <div className="text-xs mb-2">
          {profile.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <div className="flex flex-wrap justify-between font-semibold">
                <span><InlineBullet section="projects" idx={i} bulletIdx={-1}>{proj.name}</InlineBullet> | <span className="italic"><InlineBullet section="projects" idx={i} bulletIdx={-2}>{proj.tech}</InlineBullet></span></span>
                <span><InlineBullet section="projects" idx={i} bulletIdx={-3}>{proj.dates}</InlineBullet></span>
              </div>
              <ul className="list-disc ml-5 mt-1">
                {proj.bullets.map((b, j) => (
                  <li key={j}><InlineBullet section="projects" idx={i} bulletIdx={j}>{b}</InlineBullet></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Technical Skills */}
        {sectionTitle('Technical Skills')}
        <div className="text-xs mb-2">
          {Object.keys(profile.skills).map((group, i) => (
            <div key={i} className="mb-1"><span className="font-bold">{group}:</span> <InlineSkillGroup group={group} /></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder; 