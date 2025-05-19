import React from 'react';
import { MapIcon, BarChart3, Building, Settings } from 'lucide-react';
import Link from 'next/link';
import 'mapbox-gl/dist/mapbox-gl.css';
import RedirectButton from '@/components/Properties';
import { Menu } from 'lucide-react'

const MainLayout = ({ children }) => {
  
  const navItems = [
    { icon: MapIcon, label: 'Map View', href: '/' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Building, label: 'Clusters', href: '/clusters' },
    { icon: Settings, label: 'Settings', href: '/settings' }
  ];

  const sidebarClassName = `p-3 rounded-lg mb-2 transition-colors bg-blue-500 text-white`

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <nav className="w-16 bg-gray-900 flex flex-col items-center py-4">
      <RedirectButton className={sidebarClassName} label={<Menu/>} redirect="authors" />
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={sidebarClassName}
            title={label}
          >
            <Icon size={24} />
          </Link>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;