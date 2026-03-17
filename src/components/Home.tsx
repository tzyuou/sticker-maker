import React from 'react';
import { ImagePlus, Eraser, Grid2X2, Type } from 'lucide-react';
import { Page } from '../App';

export default function Home({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const features = [
    { id: 'generate', title: '貼圖生成', desc: '上傳圖片與提示詞，AI 自動生成多種表情貼圖', icon: ImagePlus, color: 'bg-blue-500' },
    { id: 'remove-bg', title: '貼圖去背', desc: '選擇背景顏色，一鍵去除背景轉為透明', icon: Eraser, color: 'bg-emerald-500' },
    { id: 'split', title: '貼圖分割', desc: '將大圖依行列分割成多張 320x320 貼圖 (最多 64 張)', icon: Grid2X2, color: 'bg-amber-500' },
    { id: 'rename', title: '貼圖改名', desc: '批次將貼圖重新命名為 01, 02... 格式', icon: Type, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">歡迎使用貼圖工具箱</h2>
        <p className="text-neutral-500 mt-2">一站式完成 LINE / Telegram 貼圖製作，從生成到命名一次搞定。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => onNavigate(f.id as Page)}
              className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-neutral-200 hover:shadow-md transition-shadow text-left group"
            >
              <div className={`p-4 rounded-xl text-white ${f.color} group-hover:scale-105 transition-transform`}>
                <Icon size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
