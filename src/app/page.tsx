"use client";
import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import FamilyTree from './components/FamilyTree';
import TreeView from './components/TreeView';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import SearchBar, { SearchFilters } from './components/SearchBar';
import { useFamilyData } from '../data/familyDataWithIds';
import { QueueListIcon, Squares2X2Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { getPublicConfig, getFamilyFullName } from '@/utils/config';
import { searchFamilyData, createFilteredFamilyData, SearchResult } from '@/utils/search';
import { buildFamilyTree } from '@/utils/familyTree';
import { AUTH_CONFIG } from '@/utils/constants';

export default function Home() {
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const { data: familyData, loading: dataLoading, error: dataError } = useFamilyData();
  
  // Search related state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    searchInInfo: true,
    selectedGenerations: [],
    yearRange: {}
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // Cache public config with useMemo to avoid recomputing on each render
  const publicConfig = useMemo(() => getPublicConfig(), []);
  const requireAuth = publicConfig.isAuthRequired;
  const familyFullName = useMemo(() => getFamilyFullName(), []);

  // Cache built tree structure with useMemo
  const treeData = useMemo(() => {
    if (dataLoading || dataError || !familyData?.generations?.length) {
      return {
        generations: [
          {
            title: "Jonyari Family Tree",
            people: []
          }
        ]
      };
    }
    return buildFamilyTree(familyData);
  }, [familyData, dataLoading, dataError]);

  // Cache filtered family data with useMemo
  const filteredFamilyData = useMemo(() => {
    if (searchResults.length > 0) {
      return createFilteredFamilyData(familyData, searchResults);
    }
    return familyData;
  }, [familyData, searchResults]);

  // Memoize search handler with useCallback
  const handleSearch = useCallback((term: string, filters: SearchFilters) => {
    setSearchTerm(term);
    setSearchFilters(filters);
  }, []);

  // Search effect - handle search logic with useEffect
  useEffect(() => {
    if (!dataLoading && !dataError && familyData?.generations?.length) {
      if (searchTerm || searchFilters.selectedGenerations.length > 0 || 
          searchFilters.yearRange.start || searchFilters.yearRange.end) {
        const results = searchFamilyData(familyData, searchTerm, searchFilters);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }
  }, [familyData, searchTerm, searchFilters, dataLoading, dataError]);

  // Memoize auth related callbacks with useCallback
  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
  }, []);
  
  const handleLogout = useCallback(() => {
    // Clear authentication info - use configured constants
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_TIME);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    // Assume auth is required when configured - real validation happens server-side
    
    // Check whether user is already authenticated - using configured constants
    const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    const authTime = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_TIME);
    
    if (token && authTime) {
      try {
        // Decode token using Buffer
        const tokenData = Buffer.from(token, 'base64').toString();
        const parsedToken = JSON.parse(tokenData);
        const expirationTime = parsedToken.exp;
        const currentTime = Date.now();
        
        // Check if token has expired
        if (currentTime < expirationTime) {
          setIsAuthenticated(true);
          setUserName(parsedToken.name || '');
        } else {
          // Remove expired token
          localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_TIME);
        }
      } catch (error) {
        console.error('Token parse error:', error);
        // Token parse error - clear stored tokens
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.AUTH_TIME);
      }
    }
    
    setLoading(false);
  }, []);

  // Show loading state
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If auth is required and user is not authenticated, show login form
  if (requireAuth && !isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated or no auth required - show family tree content
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm mb-4">
        <div className="max-w-7xl mx-auto px-4 py-6 relative">
          {/* Only show logout when auth is required and user is logged in */}
          {requireAuth && isAuthenticated && (
            <div className="absolute right-4 top-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Jonyari Logout (Logout)
              </button>
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            {familyFullName} Family Genealogy
          </h1>
          <p className="mt-2 text-gray-500 text-center text-sm tracking-wide">
            Preserving heritage · Tella Julius <br /><br />
            <Link 
              href="https://teltech-dev.github.io/jonyari/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Read The Best of Jonyari History
            </Link>
          </p>
          {requireAuth && userName && (
            <p className="mt-1 text-blue-500 text-center text-xs">
              Welcome, {familyFullName} family members
            </p>
          )}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-md flex items-center ${
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('list')}
              >
                <QueueListIcon className="h-4 w-4 mr-2" />
                Jonyari List View
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-md flex items-center ${
                  viewMode === 'tree'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('tree')}
              >
                <Squares2X2Icon className="h-4 w-4 mr-2" />
                Jonyari Tree View
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-grow">
        {dataError && (
          <div className="text-center text-red-500 mb-4">
            {dataError} - Using default data 
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 mb-6">
          {/* Search box */}
          <div className="flex justify-end mb-4">
            <SearchBar 
              onSearch={handleSearch}
              generations={familyData.generations?.map(g => g.title) ?? []}
            />
          </div>
          
          {/* Search results message */}
          {searchResults.length === 0 && (searchTerm || searchFilters.selectedGenerations.length > 0 || 
           searchFilters.yearRange.start || searchFilters.yearRange.end) && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">In the Jonyari Clan, No matching family members found</p>
              <p className="text-sm">Please try adjusting your search criteria</p>
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="text-sm text-gray-600 text-center mb-4">
              In the Jonyari Clan, Search results found <span className="font-medium text-blue-600">{searchResults.length}</span> matching results
            </div>
          )}
        </div>
        
        {viewMode === 'list' ? (
          <FamilyTree 
            familyData={filteredFamilyData} 
            searchTerm={searchTerm}
            searchInInfo={searchFilters.searchInInfo}
          />
        ) : (
          <TreeView 
            data={treeData} 
            searchTerm={searchTerm}
            searchInInfo={searchFilters.searchInInfo}
          />
        )}
      </div>
      
      <Footer />
    </main>
  );
}
