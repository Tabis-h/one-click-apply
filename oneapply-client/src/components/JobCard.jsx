import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const JobCard = ({ job }) => {
  const {
    job_title,
    employer_name,
    employer_logo,
    job_city,
    job_state,
    job_country,
    job_is_remote,
    job_posted_at_datetime_utc,
    job_description,
    job_apply_link,
    matchScore
  } = job;

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const truncateDescription = (text, maxLength = 200) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {employer_logo && (
            <img 
              src={employer_logo} 
              alt={employer_name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{job_title}</h3>
            <p className="text-gray-600">{employer_name}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(matchScore)}`}>
          {matchScore}% match
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
        <span className="flex items-center">
          📍 {job_is_remote ? 'Remote' : `${job_city}, ${job_state}, ${job_country}`}
        </span>
        {job_posted_at_datetime_utc && (
          <span>
            🕒 {formatDistanceToNow(new Date(job_posted_at_datetime_utc), { addSuffix: true })}
          </span>
        )}
      </div>

      <p className="text-gray-700 mb-4">
        {truncateDescription(job_description)}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {job_is_remote && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Remote
            </span>
          )}
        </div>
        
        <a
          href={job_apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
};

export default JobCard;