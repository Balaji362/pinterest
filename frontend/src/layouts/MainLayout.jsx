/**
 * MainLayout — wraps all pages with the Navbar and a content area.
 * Uses React Router's Outlet to render child routes.
 */

import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />
      <main className="flex-1 w-full flex flex-col items-center justify-start">
        <Outlet />
      </main>
    </div>
  );
}
