"use client";

import { useState } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { getFamilyFullName } from '@/utils/config';
import Link from 'next/link';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState('');
  // Get full family display name (adds 'Family' suffix)
  // Jonyari note: full surname display
  const familyFullName = getFamilyFullName();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebug('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDebug(`Jonyari: Login successful! Welcome ${name}`);
        // Save token to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_time', Date.now().toString());
        onLoginSuccess();
      } else {
        // On login failure show only the error message (no debug info)
        setError(data.message || 'Jonyari: Validation failed, please check the name');
      }
    } catch (err) {
      console.error('Validation request error:', err);
      setError('Jonyari: Error during validation, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Helper: show a hint for test users (debug only)
  const showHint = () => {
    setDebug('Jonyari: Please enter a family member name to login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{familyFullName} Family Genealogy</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter Jonyari Name to verify
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="sr-only">Jonyari Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Jonyari Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
                {loading ? 'Jonyari Verifying...' : 'Enter Family Genealogy'}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              type="button" 
              onClick={showHint}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Jonyari Need Help?
            </button>
          </div>
          
          {debug && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700 whitespace-pre-line">
              {debug}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-blue-600 font-medium">
              <strong>FAMILY QUOTE</strong>
              <br /><em>We rise and fall, but our roots remain interwined, drawing strength from the <strong>LOVE</strong> that binds <strong>US</strong> and the Generations that came before</em>
              <Link 
                href="https://www.muryetechacademy.com" 
                target="_blank"
                rel="noopener noreferrer" 
                className="ml-1 inline-flex items-center text-blue-700 underline font-semibold hover:text-blue-900 hover:bg-blue-50 rounded px-1 transition-colors"
              ><br /><br /><br />MM Schools Project<br />  
              </Link>
            </p>
          </div>
        </form>
         {/* Bottom copyright info */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs leading-5 text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Jonyari Family Genealogy Project <br /> All rights reserved. Tella Tech Software Solutions.
          </p>
        </div>
      </div>
    </div>
  );
} 