import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuthRedux';
import { authAPI } from '../../api/auth';
import { apiConfig } from '../../config';

const AuthDebugPanel: React.FC = () => {
  const { user, isLoading, isAuthenticated, error } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runAuthTests = async () => {
    setTesting(true);
    const results: any = {};

    // Test 1: Check localStorage
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    results.localStorage = {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      hasUser: !!storedUser,
      userPreview: storedUser ? JSON.parse(storedUser) : null
    };

    // Test 2: Check API connectivity
    try {
      const response = await fetch(apiConfig.baseUrl.replace('/api', '/health'), {
        method: 'GET',
      });
      results.apiConnectivity = {
        status: response.status,
        reachable: response.ok
      };
    } catch (error: any) {
      results.apiConnectivity = {
        status: 'error',
        reachable: false,
        error: error.message
      };
    }

    // Test 3: Test /me endpoint with current token
    if (token) {
      try {
        const response = await fetch(`${apiConfig.baseUrl}/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          results.meEndpoint = {
            status: response.status,
            success: true,
            data: userData
          };
        } else {
          const errorData = await response.text();
          results.meEndpoint = {
            status: response.status,
            success: false,
            error: errorData
          };
        }
      } catch (error: any) {
        results.meEndpoint = {
          status: 'network_error',
          success: false,
          error: error.message
        };
      }
    } else {
      results.meEndpoint = {
        status: 'no_token',
        success: false,
        error: 'No token available'
      };
    }

    // Test 4: AuthAPI methods
    results.authAPI = {
      isAuthenticated: authAPI.isAuthenticated(),
      hasRole: authAPI.hasRole(['owner', 'manager']),
      storedUser: authAPI.getStoredUser(),
      storedToken: !!authAPI.getStoredToken()
    };

    setTestResults(results);
    setTesting(false);
  };

  const clearAuth = () => {
    authAPI.clearAuthData();
    setTestResults({});
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md max-h-96 overflow-y-auto border z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Auth Debug Panel</h3>
        <button 
          onClick={() => document.querySelector('#auth-debug')?.remove()}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <strong>Redux State:</strong>
          <div className="bg-gray-100 p-2 rounded text-xs">
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
            <div>User: {user ? `${user.email} (${user.role})` : 'None'}</div>
            <div>Error: {error || 'None'}</div>
          </div>
        </div>

        <div>
          <strong>API Config:</strong>
          <div className="bg-gray-100 p-2 rounded text-xs">
            <div>Base URL: {apiConfig.baseUrl}</div>
            <div>Timeout: {apiConfig.timeout}ms</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={runAuthTests}
            disabled={testing}
            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Run Tests'}
          </button>
          <button 
            onClick={clearAuth}
            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
          >
            Clear Auth
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div>
            <strong>Test Results:</strong>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebugPanel;