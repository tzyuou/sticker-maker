import React, { useState } from 'react';
import { Page } from '../App';
import { Upload, Download, ArrowRight, ArrowLeft, FileImage } from 'lucide-react';
import { fileToBase64 } from '../utils/imageUtils';

export default function Rename({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [images, setImages] = useState<{ name: string, data: string }[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const slicedFiles = files.slice(0, 16);
      const newImages = await Promise.all(
        slicedFiles.map(async (file, index) => {
          const data = await fileToBase64(file);
          const newName = String(images.length + index + 1).padStart(2, '0');
          return { name: newName, data };
        })
      );
      setImages(prev => [...prev, ...newImages].slice(0, 16));
    }
  };

  const handleClear = () => {
    setImages([]);
  };

  const handleDownload = async () => {
    if (images.length === 0) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    images.forEach((img) => {
      const base64Data = img.data.split(',')[1];
      zip.file(`${img.name}.png`, base64Data, { base64: true });
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'renamed_stickers.zip';
    a.click();
    URL.revokeObjectURL(url);
    
    onNavigate('complete');
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">4. 貼圖改名</h2>
          <p className="text-neutral-500 mt-2">批次上傳圖片，自動命名為 01, 02...16 格式。</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('split')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft size={18} /> 上一步
          </button>
          <button
            onClick={() => onNavigate('complete')}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            完成 <ArrowRight size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">上傳圖片 (最多 16 張)</h3>
              <span className="text-sm text-neutral-500">{images.length} / 16</span>
            </div>
            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-colors ${
              images.length >= 16 
                ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed opacity-50' 
                : 'border-neutral-300 cursor-pointer bg-neutral-50 hover:bg-neutral-100'
            }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-neutral-500">
                <Upload className="w-8 h-8 mb-3" />
                <p className="text-sm font-medium">點擊或拖曳上傳多張圖片</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                multiple 
                onChange={handleImageUpload}
                disabled={images.length >= 16}
              />
            </label>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleDownload}
                disabled={images.length === 0}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
              >
                <Download size={18} /> 下載並完成
              </button>
              {images.length > 0 && (
                <button
                  onClick={handleClear}
                  className="w-full py-2 text-neutral-500 hover:text-neutral-700 text-sm font-medium"
                >
                  清空列表
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm min-h-[500px]">
          <h3 className="font-semibold mb-4">改名預覽</h3>
          
          {images.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-100 rounded-xl">
              請上傳圖片以預覽改名結果
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="bg-neutral-50 rounded-xl border border-neutral-200 p-2 flex flex-col items-center">
                  <div className="w-full aspect-square bg-white rounded-lg border border-neutral-100 mb-2 overflow-hidden flex items-center justify-center">
                    <img src={img.data} alt={img.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex items-center gap-1 text-sm font-mono text-purple-700 font-medium">
                    <FileImage size={14} />
                    {img.name}.png
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
