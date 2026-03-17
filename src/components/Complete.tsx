import React from 'react';
import { Page } from '../App';
import { CheckCircle, Home, ImagePlus } from 'lucide-react';

export default function Complete({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
        <CheckCircle size={48} />
      </div>
      
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">貼圖已完成！</h2>
        <p className="text-lg text-neutral-500 max-w-md mx-auto">
          恭喜您完成了貼圖的製作流程。您可以將下載的檔案直接上傳至通訊軟體平台。
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={() => onNavigate('generate')}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <ImagePlus size={20} />
          再次製作貼圖 (回到步驟 1)
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <Home size={20} />
          回首頁
        </button>
      </div>
    </div>
  );
}
