import React, { useState, useCallback } from 'react';
import { Page } from '../App';
import { Upload, Loader2, Download, ArrowRight, Crop } from 'lucide-react';
import { fileToBase64, getCroppedImg, createStickerGrid } from '../utils/imageUtils';
import { GoogleGenAI } from '@google/genai';
import Cropper from 'react-easy-crop';

const ART_STYLES = ['少女電繪風', '高彩電繪風', '撞色手繪風', 'Q版手繪風'];

export default function Generate({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  const [words, setWords] = useState<string>('');
  const [artStyle, setArtStyle] = useState<string>(ART_STYLES[0]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setImageSrc(base64);
      setCroppedImage(null);
      setResultImage(null);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
        setCroppedImage(cropped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!croppedImage) {
      setError('請先上傳並裁切圖片');
      return;
    }
    const wordList = words.split(/[,，\s]+/).filter(w => w.trim().length > 0);
    if (wordList.length === 0) {
      setError('請輸入至少一個提示詞');
      return;
    }
    if (wordList.length > 16) {
      setError('最多只能輸入 16 個提示詞');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setResultImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = croppedImage.split(',')[1];
      const mimeType = croppedImage.split(';')[0].split(':')[1];

      const newResults: {url: string, text: string}[] = [];

      for (let i = 0; i < wordList.length; i++) {
        setProgress(`生成中... (${i + 1}/${wordList.length})`);
        const word = wordList[i];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: `Create a sticker of this character. Expression/Action: ${word}. Art style: ${artStyle}. Emphasize hairstyle and eye features. Solid white background. Cute sticker style.`,
              },
            ],
          },
        });

        let generatedBase64 = '';
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            generatedBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }

        if (generatedBase64) {
          newResults.push({ url: generatedBase64, text: word });
        }
      }

      setProgress('組合圖片中...');
      const gridImage = await createStickerGrid(newResults);
      setResultImage(gridImage);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '生成失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">1. 貼圖生成</h2>
          <p className="text-neutral-500 mt-2">上傳圖片、裁切成正方形，並輸入提示詞與風格，AI 將為您生成 4x4 貼圖組合。</p>
        </div>
        <button
          onClick={() => onNavigate('remove-bg')}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          下一步：貼圖去背 <ArrowRight size={18} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">1. 上傳與裁切 (1:1)</h3>
              {imageSrc && !croppedImage && (
                <button 
                  onClick={() => setImageSrc(null)}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  重新上傳
                </button>
              )}
            </div>
            
            {!imageSrc ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-neutral-500">
                  <Upload className="w-8 h-8 mb-3" />
                  <p className="text-sm font-medium">點擊或拖曳上傳圖片</p>
                  <p className="text-xs mt-1">僅限 1 張圖片</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            ) : !croppedImage ? (
              <div className="space-y-4">
                <div className="relative w-full h-64 bg-neutral-100 rounded-xl overflow-hidden">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <button
                  onClick={handleCropConfirm}
                  className="w-full py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 flex justify-center items-center gap-2"
                >
                  <Crop size={18} /> 確認裁切
                </button>
              </div>
            ) : (
              <div className="relative group">
                <img src={croppedImage} alt="Cropped" className="w-full aspect-square object-cover rounded-xl border border-neutral-200" />
                <button 
                  onClick={() => setCroppedImage(null)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium rounded-xl"
                >
                  重新裁切
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-5">
            <div>
              <h3 className="font-semibold mb-2">2. 選擇藝術風格</h3>
              <select 
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {ART_STYLES.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. 輸入提示詞</h3>
              <textarea
                value={words}
                onChange={(e) => setWords(e.target.value)}
                placeholder="例如：開心, 難過, 生氣, 讚, 晚安 (以逗號或空格分隔，最多 16 個)"
                className="w-full h-32 p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !croppedImage || !words}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <><Loader2 className="animate-spin" size={20} /> {progress}</>
              ) : '開始生成'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">生成結果 (4x4 組合圖)</h3>
            {resultImage && (
              <a
                href={resultImage}
                download="stickers_grid.png"
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors font-medium"
              >
                <Download size={16} /> 下載圖片
              </a>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl overflow-hidden relative">
            {resultImage ? (
              <img src={resultImage} alt="Grid Result" className="max-w-full max-h-full object-contain" />
            ) : isGenerating ? (
              <div className="flex flex-col items-center text-neutral-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>{progress}</p>
              </div>
            ) : (
              <span className="text-neutral-400">尚無生成結果</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

