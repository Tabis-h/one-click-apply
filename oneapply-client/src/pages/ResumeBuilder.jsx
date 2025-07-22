import React, { useState } from 'react';
import ResumeEditor from '../components/ResumeEditor';
import ResumePreview from '../components/ResumePreview';

function ResumeBuilder() {
  const [resumeData, setResumeData] = useState({
    header: { 
      name: 'Mohammad Tabish Subedar', 
      phone: '+91 9113067356', 
      email: 'tabishsubedar30@gmail.com', 
      location: 'Belgaum, KA, India', 
      showPhone: true, 
      showEmail: true, 
      showLocation: true, 
      showLinkedIn: true, 
      showGitHub: true, 
      showFullUrls: false 
    },
    links: { 
      linkedin: 'https://www.linkedin.com/in/tabish-/', 
      github: 'https://github.com/Tabis-h' 
    },
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-1/2 bg-white border-r border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-800">
                ← Documents
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 font-medium">How it Works</span>
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">?</span>
              </div>
              <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-50">
                📝 Edit Content
              </button>
              <button className="text-gray-600 hover:text-gray-800 text-sm">
                ✏️ Edit Design
              </button>
            </div>
          </div>
        </div>
        
        {/* Document Name */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-medium text-gray-800">mohammad tabish_subedar</h1>
            <span className="text-gray-400">📝</span>
          </div>
        </div>
        
        {/* Fit to Page Button */}
        <div className="p-4 border-b border-gray-200">
          <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded text-sm hover:bg-blue-50">
            📄 Fit resume to page
          </button>
        </div>
        
        {/* Job Tailoring Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">🎯</span>
              <span className="text-gray-700">Tailor your resume to a job</span>
            </div>
            <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-50">
              Tailor to Job
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-1">No job added</p>
        </div>
        
        {/* Resume Editor */}
        <div className="flex-1 overflow-y-auto">
          <ResumeEditor resumeData={resumeData} setResumeData={setResumeData} />
        </div>
      </div>
      
      {/* Right Preview */}
      <div className="w-1/2 bg-gray-100 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <ResumePreview resumeData={resumeData} />
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
