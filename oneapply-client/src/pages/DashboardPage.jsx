import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiDollarSign, FiClock, FiExternalLink, FiSettings, FiUser, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import CombinedJobService from './services/combinedJobService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiStatus, setApiStatus] = useState({ tested: false, working: false, error: null });
  
  const jobService = new CombinedJobService();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadDashboardData(currentUser.uid);
        await checkApiConnection();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkApiConnection = async () => {
    try {
      const result = await jobService.testApiConnection();
      setApiStatus({
        tested: true,
        working: result.success,
        error: result.success ? null : result.error
      });
    } catch (error) {
      setApiStatus({
        tested: true,
        working: false,
                error: error.message
      });
    }
  };

  const loadDashboardData = async (userId) => {
    try {
      setLoading(true);
      console.log('Loading dashboard data for user:', userId);
      
      // Load user profile first
      const userProfile = await jobService.loadUserProfile(userId);
      console.log('User profile:', userProfile);
      
      // Get job recommendations
      const recommendations = await jobService.getRecommendations(userId);
      console.log('Recommendations loaded:', recommendations.length);
      
      setJobs(recommendations);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      const mockJobs = await jobService.mockJobService.getRecommendations();
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized job recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">OneApply</h1>
            </div>
            
            {/* API Status Indicator */}
            <div className="flex items-center space-x-4">
              {apiStatus.tested && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  apiStatus.working 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {apiStatus.working ? (
                    <>
                      <FiCheckCircle size={16} />
                      <span>API Connected</span>
                    </>
                  ) : (
                    <>
                      <FiAlertCircle size={16} />
                      <span>Using Mock Data</span>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <FiUser className="text-gray-600" />
                <span className="text-sm text-gray-700">
                  {user?.email || 'User'}
                </span>
              </div>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 transition">
                <FiSettings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'there'}!
          </h2>
          <p className="text-gray-600">
            Here are your personalized job recommendations based on your profile.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs, companies, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FiSearch className="text-indigo-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{filteredJobs.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCheckCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Match</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredJobs.filter(job => job.matchScore > 15).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiClock className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredJobs.filter(job => {
                    const jobDate = new Date(job.posted);
                    const today = new Date();
                    return jobDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Recommended Jobs ({filteredJobs.length})
          </h3>
          
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <FiSearch className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'We\'re working on finding jobs for you.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        {job.matchScore > 15 && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            High Match
                          </span>
                        )}
                        {job.source && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {job.source}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 font-medium mb-2">{job.company}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <FiMapPin size={16} className="mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <FiDollarSign size={16} className="mr-1" />
                          {job.salary}
                        </div>
                        <div className="flex items-center">
                          <FiClock size={16} className="mr-1" />
                          {new Date(job.posted).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Apply <FiExternalLink className="ml-2" size={16} />
                    </a>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {job.description.length > 200 
                      ? `${job.description.substring(0, 200)}...` 
                      : job.description
                    }
                  </p>
                  
                  {job.matchScore && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Match Score</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(job.matchScore * 2, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-indigo-600">{job.matchScore}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

