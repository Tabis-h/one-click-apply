import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { FiSearch, FiBriefcase, FiDollarSign, FiMapPin, FiClock, FiUser, FiStar, FiExternalLink } from 'react-icons/fi';
import { FaRegSadTear, FaRegSmileBeam } from 'react-icons/fa';
import { RiRemoteControlLine } from 'react-icons/ri';
import { BsLightningFill, BsGeoAlt, BsCashStack } from 'react-icons/bs';

// Helper function to get time of day greeting
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};

// Skeleton loader component for a better loading experience
const JobCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div>
          <div className="h-5 w-48 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-md"></div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-5 w-24 bg-gray-200 rounded-full"></div>
        <div className="h-5 w-28 bg-gray-200 rounded-full"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 w-full bg-gray-200 rounded-md"></div>
      <div className="h-4 w-full bg-gray-200 rounded-md"></div>
      <div className="h-4 w-3/4 bg-gray-200 rounded-md"></div>
    </div>
    <div className="mt-6 flex justify-between items-center">
      <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
      <div className="flex gap-2">
        <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);


const JobsDashboard = () => {
  const [user, loading, error] = useAuthState(auth);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    remoteOnly: false,
    highMatchOnly: false
  });

  // Get the functions URL based on environment
  const getFunctionsUrl = () => {
    if (process.env.NODE_ENV === 'development') {
      return 'http://127.0.0.1:5001/one-click-apply-cda1c/us-central1';
    }
    return 'https://us-central1-one-click-apply-cda1c.cloudfunctions.net';
  };

  const functionsUrl = getFunctionsUrl();

  // Fetch user profile when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const response = await fetch(`${functionsUrl}/getUserProfile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.uid
            })
          });

          if (response.ok) {
            const result = await response.json();
            setUserProfile(result.data);
          } else {
            console.error('Failed to fetch user profile:', response.status);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user, functionsUrl]);

  // Auto-search jobs when user profile is loaded
  useEffect(() => {
    if (userProfile && user) {
      fetchJobs();
    }
  }, [userProfile, user]);

  const fetchJobs = async (page = 1, query = '') => {
    if (!user) {
      setSearchError('Please log in to search for jobs');
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setExpandedJobId(null);

    try {
      const searchParams = {
        userId: user.uid,
        page: page,
        num_pages: 1
      };

      if (query.trim()) {
        searchParams.customQuery = query.trim();
      }

      const response = await fetch(`${functionsUrl}/searchJobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Function request failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      setJobs(data.data || []);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error fetching jobs:', error);
      setSearchError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSearch = (e) => {
    e.preventDefault();
    fetchJobs(1, customQuery);
  };

  const handleNextPage = () => {
    fetchJobs(currentPage + 1, customQuery);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchJobs(currentPage - 1, customQuery);
    }
  };

  const toggleJobExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const toggleFilter = (filterName) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const filteredJobs = jobs.filter(job => {
    if (selectedFilters.remoteOnly && !job.job_is_remote) return false;
    if (selectedFilters.highMatchOnly && job.relevance_score < 70) return false;
    return true;
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Authentication Error</h3>
          <p className="mt-2 text-sm text-gray-500">{error.message}</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <FiBriefcase className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Welcome to JobFinder</h2>
          <p className="mt-2 text-gray-600">Please log in to access personalized job recommendations.</p>
          <div className="mt-6">
            <button
              onClick={() => auth.signInWithPopup(new auth.GoogleAuthProvider())}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.667-4.146-2.675-6.735-2.675-5.522 0-10 4.479-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.67-0.069-1.325-0.189-1.961h-9.811z" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with greeting */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Good {getTimeOfDay()}, {userProfile?.firstName || user.displayName || 'Job Seeker'}!
              </h1>
              <p className="mt-1 text-gray-600">
                Here are your personalized job recommendations.
              </p>
            </div>
            <div className="flex items-center">
              <Link to="/profile" className="relative">
                <img
                  className="h-12 w-12 rounded-full object-cover border-2 border-blue-500 hover:ring-2 hover:ring-blue-500 transition-all"
                  src={userProfile?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${userProfile?.firstName || user.displayName || 'User'}&background=3B82F6&color=fff`}
                  alt="User profile"
                />
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
              </Link>
            </div>
          </div>
        </div>

        {/* User Profile Summary Card */}
        {userProfile && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-blue-500" />
              Your Profile Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FiBriefcase className="text-gray-400" />
                  Job Roles
                </p>
                <p className="font-medium mt-1">
                  {userProfile.jobRoles?.join(', ') || 'Not specified'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <BsLightningFill className="text-gray-400" />
                  Skills
                </p>
                <p className="font-medium mt-1">
                  {userProfile.skills?.slice(0, 3).join(', ') || 'Not specified'}
                  {userProfile.skills?.length > 3 && (
                    <span className="text-xs text-gray-500 ml-1">+{userProfile.skills.length - 3} more</span>
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FiClock className="text-gray-400" />
                  Work Type
                </p>
                <p className="font-medium capitalize mt-1">
                  {userProfile.workType || 'Not specified'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <RiRemoteControlLine className="text-gray-400" />
                  Remote Preferred
                </p>
                <p className="font-medium mt-1">
                  {userProfile.isRemotePreferred ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-600">No</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={handleCustomSearch} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Search for job titles, companies, or keywords..."
                className="block w-full pl-10 pr-32 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-white ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors flex items-center gap-2`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FiSearch className="h-4 w-4" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => fetchJobs(1, 'software engineer')} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">Software Engineer</button>
              <button type="button" onClick={() => fetchJobs(1, 'product manager')} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">Product Manager</button>
              <button type="button" onClick={() => fetchJobs(1, 'data scientist')} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">Data Scientist</button>
              <button type="button" onClick={() => fetchJobs(1, 'remote')} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors flex items-center gap-1"><RiRemoteControlLine className="h-4 w-4" />Remote Jobs</button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {searchError && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{searchError}</p>
                  <button onClick={() => fetchJobs(1)} className="mt-2 text-sm font-medium text-red-800 hover:text-red-700">Try again &rarr;</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State with Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        )}

        {/* Jobs List */}
        {!isLoading && filteredJobs.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                <span className="text-blue-600">{filteredJobs.length}</span> Job{filteredJobs.length !== 1 ? 's' : ''} Found
              </h2>
              
              <div className="flex flex-wrap gap-3">
                <button onClick={() => toggleFilter('remoteOnly')} className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${selectedFilters.remoteOnly ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}><RiRemoteControlLine className="h-4 w-4" />Remote Only</button>
                <button onClick={() => toggleFilter('highMatchOnly')} className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${selectedFilters.highMatchOnly ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}><FiStar className="h-4 w-4" />High Match Only</button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredJobs.map((job, index) => (
                <div key={job.job_id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            {job.employer_name ? (<span className="text-xl font-bold text-blue-600">{job.employer_name.charAt(0).toUpperCase()}</span>) : (<FiBriefcase className="h-6 w-6 text-blue-400" />)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                              <button onClick={() => toggleJobExpand(job.job_id)} className="text-left">{job.job_title}</button>
                            </h3>
                            <p className="text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                              <span className="flex items-center gap-1.5"><FiBriefcase className="text-gray-400" />{job.employer_name}</span>
                              <span className="flex items-center gap-1.5"><BsGeoAlt className="text-gray-400" />{job.job_city}, {job.job_state}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        {job.job_is_remote && (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><RiRemoteControlLine className="mr-1" />Remote</span>)}
                        {job.relevance_score > 0 && (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><FiStar className="mr-1" />{job.relevance_score}% Match</span>)}
                        <span className="text-xs text-gray-500 flex items-center gap-1"><FiClock className="text-gray-400" />{job.job_employment_type}</span>
                      </div>
                    </div>

                    {job.job_salary_min && job.job_salary_max && (
                      <div className="mb-4 flex items-center gap-2 text-green-700 font-medium">
                        <BsCashStack className="text-green-600" />
                        ${job.job_salary_min?.toLocaleString()} - ${job.job_salary_max?.toLocaleString()} 
                        {job.job_salary_period && ` per ${job.job_salary_period}`}
                      </div>
                    )}

                    <div className="mb-4">
                      <p className={`text-gray-700 text-sm leading-relaxed ${expandedJobId === job.job_id ? '' : 'line-clamp-3'}`}>{job.job_description}</p>
                      {job.job_description?.length > 300 && (<button onClick={() => toggleJobExpand(job.job_id)} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">{expandedJobId === job.job_id ? 'Show less' : 'Read more'}</button>)}
                    </div>

                    {job.user_match_reasons && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1"><FaRegSmileBeam className="text-blue-600" />Why this matches your profile:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.user_match_reasons.salary_match && (<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><FiDollarSign />Salary Match</span>)}
                          {job.user_match_reasons.location_preference && (<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1"><FiMapPin />Location Preference</span>)}
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1"><FiUser />{job.user_match_reasons.experience_level} Level</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1"><FiClock className="text-gray-400" />Posted: {new Date(job.job_posted_at_datetime_utc || job.job_posted_at_timestamp * 1000).toLocaleDateString()}</p>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex-1 sm:flex-none text-center flex items-center justify-center gap-2"><FiExternalLink className="h-4 w-4" />Apply Now</a>
                        <button onClick={() => window.open(job.job_google_link, '_blank')} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors flex-1 sm:flex-none text-center flex items-center justify-center gap-2"><FiExternalLink className="h-4 w-4" />View Details</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-2" aria-label="Pagination">
                <button onClick={handlePrevPage} disabled={currentPage <= 1} className={`px-4 py-2 border rounded-lg ${currentPage <= 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Previous</button>
                <span className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium">Page {currentPage}</span>
                <button onClick={handleNextPage} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Next</button>
              </nav>
            </div>
          </div>
        )}

        {/* No Jobs Found */}
        {!isLoading && filteredJobs.length === 0 && !searchError && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
              <FaRegSadTear className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              {customQuery ? `We couldn't find any jobs matching "${customQuery}". Try different keywords.` : "We couldn't find any jobs matching your profile. Try adjusting your search criteria or update your profile preferences."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => fetchJobs(1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Search Again</button>
              <button onClick={() => setCustomQuery('')} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Clear Search</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsDashboard;