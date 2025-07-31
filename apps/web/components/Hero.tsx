'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Hero() {

  const router = useRouter();
  
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-20 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900/50 text-blue-300 text-sm font-medium mb-8 border border-blue-800">
            <CheckCircle className="h-4 w-4 mr-2" />
            99.9% uptime guarantee
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Monitor your website's
            <span className="block text-blue-400">uptime & performance</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Get instant alerts when your website goes down. Monitor from 6 continents, 
            get detailed reports, and keep your users happy with our reliable monitoring service.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg"
              onClick={() => router.push('/signup')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg" 
              className="px-8 py-4 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center text-sm text-gray-400 space-x-6">
            <span>✓ 30-day free trial</span>
            <span>✓ No credit card required</span>
            <span>✓ Setup in 2 minutes</span>
          </div>
        </div>
        
        {/* Dashboard Preview */}
        <div className="mt-16 relative">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-700">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Uptime Dashboard</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">All systems operational</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-green-600">99.98%</div>
                  <div className="text-sm text-gray-400">Uptime (30 days)</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-blue-400">245ms</div>
                  <div className="text-sm text-gray-400">Avg Response Time</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-purple-400">6</div>
                  <div className="text-sm text-gray-400">Global Locations</div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="h-32 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded flex items-center justify-center border border-gray-600">
                  <span className="text-gray-400">Response Time Chart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}