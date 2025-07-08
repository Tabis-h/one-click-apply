// Custom hook for profile management
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export const useProfile = () => {
  const [user, authLoading] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching profile:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateProfile = async (updates) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const addExperience = async (experience) => {
    if (!user || !profile) throw new Error('User not authenticated or profile not loaded');
    
    const experiences = profile.experiences || [];
    const newExperience = {
      ...experience,
      id: Date.now(),
      createdAt: new Date()
    };
    
    return updateProfile({
      experiences: [...experiences, newExperience]
    });
  };

  const updateExperience = async (index, experience) => {
    if (!user || !profile) throw new Error('User not authenticated or profile not loaded');
    
    const experiences = [...(profile.experiences || [])];
    experiences[index] = {
      ...experience,
      updatedAt: new Date()
    };
    
    return updateProfile({ experiences });
  };

  const deleteExperience = async (index) => {
    if (!user || !profile) throw new Error('User not authenticated or profile not loaded');
    
    const experiences = [...(profile.experiences || [])];
    experiences.splice(index, 1);
    
    return updateProfile({ experiences });
  };

  return {
    profile,
    loading: loading || authLoading,
    error,
    updateProfile,
    addExperience,
    updateExperience,
    deleteExperience,
    user
  };
};