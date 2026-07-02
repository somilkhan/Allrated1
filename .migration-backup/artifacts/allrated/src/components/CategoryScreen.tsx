import { categoryData, categoryOrder } from '../data/catalog';
import type { CategoryKey } from '../data/catalog';

interface CategoryScreenProps {
  onPick: (cat: CategoryKey) => void;
}

export function CategoryScreen({ onPick }: CategoryScreenProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto bg-gradient-to-br from-ink-900 to-ink-700 px-5 py-8 animate-fade-in">
      <div className="w-full max-w-[500px] text-center">
        <div className="mb-8">
          <h1 className="font-display text-[34px] font-black leading-tight tracking-tight bg-gradient-to-br from-white to-[#aaa] bg-clip-text text-transparent">
            Pick your lane
          </h1>
          <p className="mt-2 text-sm text-white/55">Choose a category to start rating</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categoryOrder.map((key, i) => {
            const cat = categoryData[key];
            return (
              <button
                key={key}
                onClick={() => onPick(key)}
                style={{ animationDelay: `${i * 0.2}s` }}
                className="group rounded-3xl border border-white/[0.09] bg-ink-600/60 p-7 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              >
                <span
                  className="mb-3 block animate-float text-4xl"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {cat.emoji}
                </span>
                <h3 className="mb-1 text-base font-bold">{cat.label}</h3>
                <p className="text-xs text-white/55">{cat.blurb}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
