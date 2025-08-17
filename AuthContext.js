import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          try {
            await authAPI.getProfile();
          } catch (error) {
            // Token is invalid, clear storage
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response.data.data;

      // Store token and user data
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (error) {
      // If backend is not available, try to simulate login with stored user data
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, checking for stored user data...');
        
        // Check if there's a stored user with matching email
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.email === email) {
            // Simulate successful login
            const simulatedToken = 'simulated-token-' + Date.now();
            localStorage.setItem('token', simulatedToken);
            setToken(simulatedToken);
            setUser(user);
            
            toast.success('Login successful! (Simulated - Backend offline)');
            return user;
          }
        }
        
        // If no stored user found, create a demo user for testing
        console.log('No stored user found, creating demo user for testing...');
        const demoUser = {
          id: 'demo-user-' + Date.now(),
          firstName: 'Demo',
          lastName: 'User',
          email: email,
          role: 'customer',
          isEmailVerified: true
        };
        
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        setToken(demoToken);
        setUser(demoUser);
        
        toast.success('Login successful! (Demo mode - Backend offline)');
        return demoUser;
      }
      
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response.data.data;

      // Store token and user data
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);

      toast.success('Registration successful!');
      return newUser;
    } catch (error) {
      // If backend is not available, simulate successful registration
      if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch')) {
        console.log('Backend not available, simulating registration...');
        
        const simulatedUser = {
          id: Date.now().toString(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role || 'customer',
          isEmailVerified: false
        };
        
        const simulatedToken = 'simulated-token-' + Date.now();
        
        // Store simulated data
        localStorage.setItem('token', simulatedToken);
        localStorage.setItem('user', JSON.stringify(simulatedUser));
        
        setToken(simulatedToken);
        setUser(simulatedUser);
        
        toast.success('Registration successful! (Simulated - Backend offline)');
        return simulatedUser;
      }
      
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Optional: Call logout endpoint
    if (token) {
      // Note: We don't await this as we want to logout immediately
      authAPI.logout?.().catch(console.error);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data.data;

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      throw new Error(message);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      throw new Error(message);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset email sent!');
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset request failed';
      throw new Error(message);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      throw new Error(message);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const updatedUser = response.data.data;

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout the user
      logout();
      throw error;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Check if user has permission (based on role hierarchy)
  const hasPermission = (requiredRole) => {
    const roleHierarchy = {
      'customer': 0,
      'sales_agent': 1,
      'technician': 1,
      'service_advisor': 2,
      'inventory_manager': 2,
      'sales_manager': 3,
      'service_manager': 3,
      'admin': 4
    };

    const userLevel = roleHierarchy[user?.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshUser,
    hasRole,
    hasAnyRole,
    hasPermission,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
