import React, { useState } from 'react';
import { Page } from '../App';
import { Upload, Download, ArrowRight, ArrowLeft, CheckSquare } from 'lucide-react';
import { fileToBase64, splitImage, resizeImage, resizeImageFit } from '../utils/imageUtils';

export default function Split({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(4);
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [mainIndex, setMainIndex] = useState<number | null>(null);
  const [tabIndex, setTabIndex] = useState<number | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setImage(base64);
      setResults([]);
      setSelected(new Set());
      setMainIndex(null);
      setTabIndex(null);
    }
  };

  const handleSplit = async () => {
    if (!image) return;
    const pieces = await splitImage(image, rows, cols, 320, 320);
    setResults(pieces);
    setSelected(new Set(pieces.map((_, i) => i)));
    setMainIndex(null);
    setTabIndex(null);
  };

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const handleDownload = async (all: boolean) => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    const toDownloadIndices = all ? results.map((_, i) => i) : Array.from(selected);
    
    if (toDownloadIndices.length === 0 && mainIndex === null && tabIndex === null) return;

    toDownloadIndices.forEach((index, i) => {
      const base64Data = results[index].split(',')[1];
      const fileName = `${String(i + 1).padStart(2, '0')}.png`;
      zip.file(fileName, base64Data, { base64: true });
    });

    if (mainIndex !== null && results[mainIndex]) {
      const resizedMain = await resizeImage(results[mainIndex], 240, 240);
      zip.file('main.png', resizedMain.split(',')[1], { base64: true });
    }

    if (tabIndex !== null && results[tabIndex]) {
      const resizedTab = await resizeImageFit(results[tabIndex], 96, 74);
      zip.file('tab.png', resizedTab.split(',')[1], { base64: true });
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'split_stickers.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">3. 貼圖分割</h2>
          <p className="text-neutral-500 mt-2">將大圖依照行列數分割成多張 320x320 貼圖 (最多 8x8 共 64 張)。</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('remove-bg')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft size={18} /> 上一步
          </button>
          <button
            onClick={() => onNavigate('rename')}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            下一步：貼圖改名 <ArrowRight size={18} />
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">橫排數量 (列)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={rows}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRows(val > 8 ? 8 : val);
                  }}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">直排數量 (行)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={cols}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCols(val > 8 ? 8 : val);
                  }}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm text-amber-800 flex justify-between">
                <span>預計分割總數：</span>
                <span className="font-bold text-lg">{rows * cols} 張</span>
              </p>
            </div>

            <button
              onClick={handleSplit}
              disabled={!image}
              className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              開始分割
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">分割結果 ({results.length})</h3>
            {results.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(false)}
                  disabled={selected.size === 0}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  <Download size={16} /> 下載已選 ({selected.size})
                </button>
                <button
                  onClick={() => handleDownload(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors font-medium"
                >
                  <Download size={16} /> 全部下載
                </button>
              </div>
            )}
          </div>
          
          {results.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-100 rounded-xl">
              尚無分割結果
            </div>
          ) : (
            <div 
              className="grid gap-2" 
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {results.map((res, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-lg border-2 overflow-hidden relative group ${
                    selected.has(i) ? 'border-amber-500' : 'border-transparent hover:border-neutral-300'
                  }`}
                >
                  <img 
                    src={res} 
                    alt={`Piece ${i}`} 
                    className="w-full h-full object-cover bg-neutral-100 cursor-pointer" 
                    onClick={() => toggleSelect(i)}
                  />
                  <div 
                    className={`absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center pointer-events-none ${
                      selected.has(i) ? 'bg-amber-500 text-white' : 'bg-black/20 text-transparent'
                    }`}
                  >
                    <CheckSquare size={14} />
                  </div>
                  
                  {mainIndex === i && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded shadow-sm pointer-events-none">
                      MAIN
                    </div>
                  )}
                  
                  {tabIndex === i && (
                    <div 
                      className="absolute right-2 px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded shadow-sm pointer-events-none" 
                      style={{ top: mainIndex === i ? '28px' : '8px' }}
                    >
                      TAB
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMainIndex(mainIndex === i ? null : i); }}
                      className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${mainIndex === i ? 'bg-blue-500 text-white' : 'bg-white/90 text-neutral-800 hover:bg-white'}`}
                    >
                      設為 Main
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTabIndex(tabIndex === i ? null : i); }}
                      className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${tabIndex === i ? 'bg-purple-500 text-white' : 'bg-white/90 text-neutral-800 hover:bg-white'}`}
                    >
                      設為 Tab
                    </button>
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
