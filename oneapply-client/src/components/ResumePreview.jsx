import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

function ResumePreview({ resumeData }) {
  const previewRef = useRef();

  const exportToPDF = () => {
    html2pdf()
      .set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${resumeData.header.name || 'resume'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      })
      .from(previewRef.current)
      .save();
  };

  // Section header component
  const SectionHeader = ({ children }) => (
    <div className="mt-4 mb-1">
      <div className="text-xs font-bold tracking-wide uppercase border-b border-black pb-0.5">
        {children}
      </div>
    </div>
  );

  // Skills rendering with proper categorization
  const renderSkills = () => {
    if (!resumeData.skills || resumeData.skills.length === 0) return null;
    const byType = type => resumeData.skills.filter(s => s.type === type).map(s => s.name).join(', ');
    
    const categories = [
      { label: 'Languages', type: 'language' },
      { label: 'Frameworks', type: 'framework' },
      { label: 'Tools', type: 'tool' },
      { label: 'Libraries', type: 'library' }
    ];

    return (
      <div className="text-sm leading-tight">
        {categories.map((category, index) => {
          const skills = byType(category.type);
          if (!skills) return null;
          return (
            <div key={category.type} className="mb-1">
              <span className="font-semibold">{category.label}:</span> {skills}
            </div>
          );
        })}
      </div>
    );
  };

  // Certificates rendering
  const renderCertificates = () => (
    <div className="mt-1">
      {resumeData.certifications.map((cert, i) => (
        <div key={i} className="flex justify-between text-sm mb-1">
          <div>
            <span className="font-bold">{cert.name}</span>
            {cert.link && (
              <a href={cert.link} className="text-blue-600 underline ml-2" target="_blank" rel="noopener noreferrer">
                View Certificate
              </a>
            )}
          </div>
          <div className="text-right">
            <div>Issued: {cert.year}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // Contact line
  const contactLine = [
    resumeData.header.phone && resumeData.header.showPhone !== false ? resumeData.header.phone : null,
    resumeData.header.email && resumeData.header.showEmail !== false ? resumeData.header.email : null,
    resumeData.header.location && resumeData.header.showLocation !== false ? resumeData.header.location : null,
    resumeData.links.linkedin && resumeData.header.showLinkedIn !== false ? resumeData.links.linkedin : null,
    resumeData.links.github && resumeData.header.showGitHub !== false ? resumeData.links.github : null,
  ].filter(Boolean).join(' | ');

  return (
    <div>
      <button onClick={exportToPDF} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 mb-4 rounded transition-colors duration-200">
        Export as PDF
      </button>
      
      <div id="resume-preview" ref={previewRef} className="bg-white text-gray-900 max-w-3xl mx-auto p-8 shadow-lg rounded-lg" style={{ fontFamily: 'Georgia, Times, serif' }}>
        {/* Header - Name */}
        <div className="text-center text-3xl font-bold mb-1" style={{ fontFamily: 'Georgia, Times, serif' }}>
          {resumeData.header.name || 'Mohd. Tabish Subedar'}
        </div>
        
        {/* Header - Contact Info */}
        <div className="text-center text-sm mb-4">
          <div className="flex justify-center items-center gap-x-1">
            {contactLine.split(' | ').map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-1">|</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Professional Summary */}
        {resumeData.summary && (
          <div>
            <SectionHeader>PROFESSIONAL SUMMARY</SectionHeader>
            <div className="text-sm mb-2 text-justify leading-tight">
              {resumeData.summary}
            </div>
          </div>
        )}

        {/* Education */}
        <SectionHeader>EDUCATION</SectionHeader>
        {resumeData.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{edu.institute}</p>
                <p className="text-sm italic">{edu.location}</p>
              </div>
              <p className="text-sm text-right">{edu.year}</p>
            </div>
            <p className="text-sm italic">{edu.degree}</p>
          </div>
        ))}

        {/* Experience */}
        <SectionHeader>EXPERIENCE</SectionHeader>
        {resumeData.experience.map((exp, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between">
              <div>
                <p><strong>{exp.role}</strong> – {exp.company}</p>
                <p className="text-sm italic">{exp.location}</p>
              </div>
              <p className="text-sm text-right">{exp.duration}</p>
            </div>
            {exp.bullets && exp.bullets.length > 0 && (
              <ul className="list-disc pl-5 text-sm leading-tight mt-1">
                {exp.bullets.map((bullet, bulletIndex) => (
                  bullet && <li key={bulletIndex} className="mb-1">{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* Projects */}
        <SectionHeader>PROJECTS</SectionHeader>
        {resumeData.projects.map((proj, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between">
              <div>
                <p><strong>{proj.title}</strong>{proj.tech && <span className="italic font-normal"> | {proj.tech}</span>}</p>
                {proj.link && (
                  <p className="text-sm text-blue-600 underline">
                    <a href={proj.link} target="_blank" rel="noopener noreferrer">GitHub Repository</a>
                  </p>
                )}
              </div>
              <p className="text-sm text-right">{proj.duration}</p>
            </div>
            {(proj.bullets || proj.description) && (
              <ul className="list-disc pl-5 text-sm leading-tight mt-1">
                {proj.bullets ? proj.bullets.map((bullet, bulletIndex) => (
                  bullet && <li key={bulletIndex} className="mb-1">{bullet}</li>
                )) : <li className="mb-1">{proj.description}</li>}
              </ul>
            )}
          </div>
        ))}

        {/* Technical Skills */}
        <SectionHeader>TECHNICAL SKILLS</SectionHeader>
        {renderSkills()}

        {/* Certificates */}
        <SectionHeader>CERTIFICATES</SectionHeader>
        {renderCertificates()}
      </div>
    </div>
  );
}

export default ResumePreview; 