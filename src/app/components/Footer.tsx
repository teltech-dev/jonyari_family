"use client";

import Link from 'next/link';
import { getFamilyFullName } from '@/utils/config';

const Footer = () => {
  // Get full family display name (adds 'Family' suffix)
  const familyFullName = getFamilyFullName();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left - About */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">About the Genealogy</h3>
            <p className="text-sm leading-6 text-gray-600">
              The {familyFullName} Family Genealogy is a website to record our family history and heritage. It aims at preserving family memories and passing on family culture.
            </p>
          </div>

          {/* Middle - Open Source */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">Designed and Distributed</h3>
            <p className="text-sm leading-6 text-gray-600">
              The app is designed and developed by Tella and Family for the Jonyari family's Geneology.
              Tella strongly believes in cheerishing and preserving family heritage for future generations.
              Read the Jonyari History
            </p>
            <p className="text-sm leading-6 text-gray-600">
              <Link 
                href="https://teltech-dev.github.io/jonyari/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Read The Best of Jonyari History
              </Link>
            </p>
          </div>

          {/* Right - Related Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">Related Links</h3>
            <ul role="list" className="mt-2 space-y-2">
              <li>
                <Link 
                  href="https://www.muryetechacademy.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm leading-6 text-blue-600 hover:text-blue-800"
                >
                  Upcoming Peace Projects (Memorial Schools Project)
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                  The MM Schools Project is dedicated to providing quality education to underprivileged children in rural areas, honoring the legacy of the Murye family and the greater Jonyari clan at large.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright info */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs leading-5 text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Jonyari Family Genealogy Project <br /> All rights reserved. Tella Tech Software Solutions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 