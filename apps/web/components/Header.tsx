'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 border-b border-gray-800 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-white">BetterUptime</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => router.push('/signin')}>
              Sign In
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => router.push('/signup')}>
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-3 space-y-3">
            <a href="#features" className="block py-2 text-gray-300 hover:text-white">
              Features
            </a>
            <a href="#docs" className="block py-2 text-gray-300 hover:text-white">
              Docs
            </a>
            <a href="#support" className="block py-2 text-gray-300 hover:text-white">
              Support
            </a>
            <div className="flex flex-col space-y-2 pt-4">
              <Button 
                onClick={() => router.push('/signin')} variant="ghost" className="justify-start text-gray-300 hover:text-white hover:bg-gray-800">
                Sign In
              </Button>
              <Button onClick={() => router.push('/signup')} 
                className="bg-blue-500 hover:bg-blue-600 text-white justify-start">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}