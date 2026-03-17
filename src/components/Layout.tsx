import React from 'react';
import { Home, ImagePlus, Eraser, Grid2X2, Type } from 'lucide-react';
import { Page } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const navItems = [
    { id: 'home', label: '首頁', icon: Home },
    { id: 'generate', label: '1. 貼圖生成', icon: ImagePlus },
    { id: 'remove-bg', label: '2. 貼圖去背', icon: Eraser },
    { id: 'split', label: '3. 貼圖分割', icon: Grid2X2 },
    { id: 'rename', label: '4. 貼圖改名', icon: Type },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans">
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ImagePlus className="text-indigo-600" />
            貼圖工具箱
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-neutral-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
