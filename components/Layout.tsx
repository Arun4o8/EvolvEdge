
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { NAV_ITEMS } from '../constants';

export const Layout: React.FC = () => {
  const location = useLocation();
  const currentNavItem = NAV_ITEMS.find(item => item.path === location.pathname);
  const title = currentNavItem ? currentNavItem.label : 'EvolvEdge AI';

  return (
    <div className="relative min-h-screen pb-20">
      <Header title={title} />
      <main className="p-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
