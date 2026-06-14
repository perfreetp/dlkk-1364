import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Toast } from './Toast';
import { ModalContainer } from '@/components/business/ModalContainer';
import { ScreenshotViewer } from '@/components/business/ScreenshotViewer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Toast />
      <ModalContainer />
      <ScreenshotViewer />
    </div>
  );
};
