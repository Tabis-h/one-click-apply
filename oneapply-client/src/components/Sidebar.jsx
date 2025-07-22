import React from 'react';

const sections = ['Header', 'Links', 'Summary', 'Experience', 'Education', 'Skills', 'Projects', 'Languages', 'Certifications'];

function Sidebar() {
  return (
    <div className="w-64 bg-blue-800 text-white p-4 h-full">
      <h2 className="text-xl font-bold mb-4">Resume Sections</h2>
      <ul>
        {sections.map((section) => (
          <li key={section}>
            <a href={`#${section.toLowerCase()}`} className="block py-2 hover:bg-blue-700">
              {section}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar; 