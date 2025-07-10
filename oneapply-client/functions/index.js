const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const cors = require('cors')({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Get API key from Firebase config
function getApiKey() {
  const configKey = functions.config().rapidapi?.key;
  if (configKey) {
    console.log('Using Firebase config API key');
    return configKey;
  }
  
  const envKey = process.env.RAPIDAPI_KEY;
  if (envKey) {
    console.log('Using environment variable API key');
    return envKey;
  }
  
  console.error('No API key found in config or environment');
  return null;
}

// Helper function to build search query from user profile
function buildSearchQuery(userProfile) {
  const queryParts = [];
  
  // Add job roles
  if (userProfile.jobRoles && userProfile.jobRoles.length > 0) {
    queryParts.push(...userProfile.jobRoles);
  }
  
  // Add skills
  if (userProfile.skills && userProfile.skills.length > 0) {
    queryParts.push(...userProfile.skills);
  }
  
  // Add industries as context
  if (userProfile.industries && userProfile.industries.length > 0) {
    queryParts.push(...userProfile.industries);
  }
  
  // If no specific roles/skills, use searchable fields
  if (queryParts.length === 0) {
    if (userProfile.searchableRoles) {
      queryParts.push(userProfile.searchableRoles);
    }
    if (userProfile.searchableSkills) {
      queryParts.push(userProfile.searchableSkills);
    }
  }
  
  // Fallback to generic search
  if (queryParts.length === 0) {
    queryParts.push('software developer');
  }
  
  return queryParts.join(' OR ');
}

// Helper function to determine employment types from user profile
function getEmploymentTypes(userProfile) {
  const types = [];
  
  if (userProfile.workType) {
    switch (userProfile.workType.toLowerCase()) {
      case 'full-time':
      case 'fulltime':
        types.push('FULLTIME');
        break;
      case 'part-time':
      case 'parttime':
        types.push('PARTTIME');
        break;
      case 'contract':
        types.push('CONTRACTOR');
        break;
      case 'flexible':
        types.push('FULLTIME', 'PARTTIME');
        break;
      default:
        types.push('FULLTIME');
    }
  } else {
    types.push('FULLTIME');
  }
  
  return types.join(',');
}

// Helper function to get target country
function getTargetCountry(userProfile) {
  if (userProfile.targetCountries && userProfile.targetCountries.length > 0) {
    const country = userProfile.targetCountries[0];
    // Map country names to country codes
    const countryMap = {
      'United States': 'US',
      'Canada': 'CA',
      'United Kingdom': 'GB',
      'Australia': 'AU',
      'Germany': 'DE',
      'India': 'IN',
      // Add more mappings as needed
    };
    return countryMap[country] || 'US';
  }
  return 'US';
}

// Job search proxy function with user profile integration
exports.searchJobs = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      console.log('=== searchJobs function called ===');
      console.log('Request method:', req.method);
      console.log('Request body:', req.body);

      // Handle preflight OPTIONS request
      if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
      }

      // Only allow POST requests for actual API calls
      if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // Get the API key
      const rapidApiKey = getApiKey();
      
      if (!rapidApiKey) {
        console.error('❌ RapidAPI key not found');
        return res.status(500).json({ 
          error: 'API key not configured',
          details: 'API key not found in Firebase config'
        });
      }

      // Extract userId from request body
      const { userId, customQuery, page = 1, num_pages = 1 } = req.body;
      
      if (!userId) {
        console.error('❌ User ID not provided');
        return res.status(400).json({ 
          error: 'User ID required',
          details: 'Please provide userId in request body'
        });
      }

      console.log('🔍 Fetching user profile for userId:', userId);

      // Fetch user profile from Firestore
      let userProfile = {};
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
          console.error('❌ User not found:', userId);
          return res.status(404).json({ 
            error: 'User not found',
            details: `No user profile found for userId: ${userId}`
          });
        }
        
        userProfile = userDoc.data();
        console.log('✅ User profile fetched:', {
          name: `${userProfile.firstName} ${userProfile.lastName}`,
          jobRoles: userProfile.jobRoles,
          skills: userProfile.skills,
          location: userProfile.location,
          workType: userProfile.workType,
          isRemotePreferred: userProfile.isRemotePreferred
        });
        
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch user profile',
          details: error.message
        });
      }

      // Normalize skills to always be an array
      if (userProfile.skills) {
        if (Array.isArray(userProfile.skills)) {
          // already array
        } else if (typeof userProfile.skills === 'string') {
          userProfile.skills = userProfile.skills.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          userProfile.skills = [];
        }
      } else {
        userProfile.skills = [];
      }

      // Build search parameters from user profile
      const searchQuery = customQuery || buildSearchQuery(userProfile);
      const employmentTypes = getEmploymentTypes(userProfile);
      const targetCountry = getTargetCountry(userProfile);
      const remoteJobsOnly = userProfile.isRemotePreferred || false;
      
      // Determine date posted based on user availability
      let datePosted = 'month';
      if (userProfile.availability === 'immediate') {
        datePosted = 'week';
      } else if (userProfile.availability === 'within_month') {
        datePosted = 'month';
      }

      console.log('🎯 Search parameters built from profile:', { 
        searchQuery,
        employmentTypes,
        targetCountry,
        remoteJobsOnly,
        datePosted,
        page,
        num_pages
      });

      // Build query parameters for the API
      const searchParams = new URLSearchParams({
        query: searchQuery,
        page: page.toString(),
        num_pages: num_pages.toString(),
        date_posted: datePosted,
        country: targetCountry
      });

      if (remoteJobsOnly) {
        searchParams.append('remote_jobs_only', 'true');
      }
      
      if (employmentTypes) {
        searchParams.append('employment_types', employmentTypes);
      }

      // Make request to JSearch API
      const apiUrl = `https://jsearch.p.rapidapi.com/search?${searchParams}`;
      
      console.log('🔍 Making request to JSearch API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
      });

      console.log('📡 JSearch API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ JSearch API request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        return res.status(response.status).json({ 
          error: `JSearch API request failed: ${response.status}`,
          details: errorText,
          message: 'Failed to fetch jobs from external API'
        });
      }

      const data = await response.json();
      console.log('✅ JSearch API response received:', {
        status: data.status,
        jobCount: data.data?.length || 0,
        parameters: data.parameters
      });
      
      // Filter jobs based on user preferences
      let filteredJobs = data.data || [];
      
      // Filter by salary expectations if specified
      if (userProfile.salaryExpectation && userProfile.salaryExpectation > 0) {
        filteredJobs = filteredJobs.filter(job => {
          if (job.job_salary_min) {
            return job.job_salary_min >= userProfile.salaryExpectation;
          }
          return true; // Keep jobs without salary info
        });
      }
      
      // Add relevance score based on user profile
      filteredJobs = filteredJobs.map(job => {
        let relevanceScore = 0;
        const jobTitle = (job.job_title || '').toLowerCase();
        const jobDescription = (job.job_description || '').toLowerCase();
        
        // Check job roles match
        if (userProfile.jobRoles) {
          userProfile.jobRoles.forEach(role => {
            if (jobTitle.includes(role.toLowerCase()) || jobDescription.includes(role.toLowerCase())) {
              relevanceScore += 10;
            }
          });
        }
        
        // Check skills match
        if (userProfile.skills) {
          userProfile.skills.forEach(skill => {
            const skillName = typeof skill === 'string' ? skill : skill?.name;
            if (
              typeof skillName === 'string' &&
              (jobTitle.includes(skillName.toLowerCase()) || jobDescription.includes(skillName.toLowerCase()))
            ) {
              relevanceScore += 5;
            }
          });
        }
        
        return {
          ...job,
          relevance_score: relevanceScore,
          user_match_reasons: {
            salary_match: !userProfile.salaryExpectation || !job.job_salary_min || job.job_salary_min >= userProfile.salaryExpectation,
            location_preference: userProfile.isRemotePreferred ? job.job_is_remote : true,
            experience_level: userProfile.experience || 'entry'
          }
        };
      });
      
      // Sort by relevance score
      filteredJobs.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
      
      // Return the personalized job data
      return res.status(200).json({
        ...data,
        data: filteredJobs,
        user_profile_applied: {
          userId: userId,
          searchQuery: searchQuery,
          preferences: {
            workType: userProfile.workType,
            isRemotePreferred: userProfile.isRemotePreferred,
            targetCountries: userProfile.targetCountries,
            salaryExpectation: userProfile.salaryExpectation
          }
        },
        timestamp: new Date().toISOString(),
        source: 'jsearch-api-personalized'
      });

    } catch (error) {
      console.error('💥 Error in searchJobs function:', {
        message: error.message,
        stack: error.stack
      });
      
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        message: 'An unexpected error occurred while searching for jobs'
      });
    }
  });
});

// Get user profile endpoint
exports.getUserProfile = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
      }

      const { userId } = req.method === 'GET' ? req.query : req.body;
      
      if (!userId) {
        return res.status(400).json({ 
          error: 'User ID required',
          details: 'Please provide userId parameter'
        });
      }

      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ 
          error: 'User not found',
          details: `No user profile found for userId: ${userId}`
        });
      }
      
      const userProfile = userDoc.data();
      
      return res.status(200).json({
        success: true,
        data: userProfile,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message
      });
    }
  });
});

// Health check endpoint
exports.healthCheck = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const rapidApiKey = getApiKey();
      
      return res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!rapidApiKey,
        environment: process.env.NODE_ENV || 'development',
        services: {
          firestore: 'connected',
          rapidapi: !!rapidApiKey ? 'configured' : 'not configured'
        }
      });
    } catch (error) {
      console.error('Health check error:', error);
      return res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
});
