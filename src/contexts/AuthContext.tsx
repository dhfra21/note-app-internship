'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if token exists in cookies on initial load
    const storedToken = Cookies.get('token');
    console.log('Auth State Check:', {
      hasStoredToken: !!storedToken,
      tokenLength: storedToken?.length,
      isAuthenticated,
      currentPath: pathname
    });
    
    if (storedToken) {
      // Verify token is valid by making a test request
      fetch('http://localhost:3001/api/notes', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (response.ok) {
          setToken(storedToken);
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          // If token is invalid, clear it and redirect to login
          console.log('Invalid token detected, logging out');
          Cookies.remove('token');
          setToken(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          if (pathname !== '/login' && pathname !== '/register') {
            router.push('/login');
          }
        }
      })
      .catch(error => {
        console.error('Error verifying token:', error);
        // On error, clear token and redirect to login
        Cookies.remove('token');
        setToken(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        if (pathname !== '/login' && pathname !== '/register') {
          router.push('/login');
        }
      });
    } else {
      // No token found, ensure we're logged out
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  const login = (newToken: string) => {
    console.log('Login called with token:', {
      tokenLength: newToken.length,
      tokenPreview: newToken.substring(0, 20) + '...'
    });
    
    Cookies.set('token', newToken, { expires: 7 }); // Token expires in 7 days
    setToken(newToken);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = () => {
    console.log('Logout called, clearing auth state');
    Cookies.remove('token');
    setToken(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    router.push('/login');
  };

  // Don't render children while loading to prevent flash of wrong content
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 