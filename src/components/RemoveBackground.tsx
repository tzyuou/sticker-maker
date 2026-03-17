import React, { useState } from 'react';
import { Page } from '../App';
import { Upload, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import { fileToBase64, removeColor } from '../utils/imageUtils';

export default function RemoveBackground({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [tolerance, setTolerance] = useState<number>(30);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setImage(base64);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const res = await removeColor(image, bgColor, tolerance);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">2. 貼圖去背</h2>
          <p className="text-neutral-500 mt-2">選擇背景顏色，將其轉換為透明背景。</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('generate')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft size={18} /> 上一步
          </button>
          <button
            onClick={() => onNavigate('split')}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            下一步：貼圖分割 <ArrowRight size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-semibold mb-4">上傳圖片</h3>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
              {image ? (
                <img src={image} alt="Preview" className="h-full object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-neutral-500">
                  <Upload className="w-8 h-8 mb-3" />
                  <p className="text-sm font-medium">點擊或拖曳上傳圖片</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">目標背景色</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm font-mono text-neutral-500 uppercase">{bgColor}</span>
              </div>
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-neutral-700 mb-2">
                <span>容差值 (Tolerance)</span>
                <span>{tolerance}</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <p className="text-xs text-neutral-400 mt-1">數值越大，去除的相近顏色越多</p>
            </div>

            <button
              onClick={handleProcess}
              disabled={!image || isProcessing}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? '處理中...' : '開始去背'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">去背結果</h3>
            {result && (
              <a
                href={result}
                download="transparent_sticker.png"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors font-medium"
              >
                <Download size={16} /> 下載圖片
              </a>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl overflow-hidden relative bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyEgSRC0AQAK9CGVG3P3xgAAAABJRU5ErkJggg==')]">
            {result ? (
              <img src={result} alt="Result" className="max-w-full max-h-full object-contain" />
            ) : image ? (
              <img src={image} alt="Original" className="max-w-full max-h-full object-contain opacity-50" />
            ) : (
              <span className="text-neutral-400">請先上傳圖片並點擊去背</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
