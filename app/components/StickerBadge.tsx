import { Star, Flame, Hourglass } from 'lucide-react';

export default function StickerBadge({ type }: { type: string }) {
  if (!type) return null;

  switch (type) {
    case 'BEST SELLER':
      return (
        <div className="absolute -top-4 -right-4 z-30 flex flex-col items-center group-hover:scale-110 transition-transform duration-300 origin-top">
          <div className="relative flex flex-col items-center animate-bounce">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-xl border-2 border-white flex flex-col items-center justify-center text-center z-10">
              <span className="text-[8px] font-black text-yellow-900 leading-none">BEST</span>
              <span className="text-[8px] font-black text-white leading-none mt-0.5 drop-shadow-md">SELLER</span>
              <Star className="w-3 h-3 text-white fill-white mt-0.5 absolute -top-1 right-0 animate-pulse" />
            </div>
            <div className="absolute -bottom-3 z-0 flex gap-1">
              <div className="w-3 h-5 bg-yellow-600 transform skew-y-[20deg] rounded-b-sm" />
              <div className="w-3 h-5 bg-yellow-600 transform -skew-y-[20deg] rounded-b-sm" />
            </div>
          </div>
        </div>
      );
    case 'SALE':
      return (
        <div className="absolute -top-3 -right-2 z-30 group-hover:rotate-6 transition-transform duration-300 origin-bottom-left">
          <div className="bg-red-600 text-white pl-5 pr-3 py-1 rounded-md flex items-center justify-center border-2 border-white/50 relative shadow-lg">
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
            <span className="font-black text-[10px] tracking-widest">SALE</span>
          </div>
        </div>
      );
    case 'NEW':
      return (
        <div className="absolute -top-5 -right-5 z-30 group-hover:rotate-180 transition-transform duration-700">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full text-green-400 drop-shadow-lg animate-pulse">
              <path fill="currentColor" d="M50 0L61 35L98 35L68 57L79 91L50 70L21 91L32 57L2 35L39 35Z" />
            </svg>
            <span className="absolute text-green-900 font-black text-[10px] transform -rotate-12">NEW!</span>
          </div>
        </div>
      );
    case 'HOT':
      return (
        <div className="absolute -top-3 -right-3 z-30 group-hover:scale-110 transition-transform duration-300">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 border-2 border-white shadow-lg flex flex-col items-center justify-center">
            <Flame className="w-4 h-4 text-yellow-200 fill-yellow-200" />
            <span className="text-white font-black text-[9px] italic pr-1">HOT</span>
          </div>
        </div>
      );
    case 'COMING SOON':
      return (
        <div className="absolute -top-3 -right-3 z-30 group-hover:-translate-y-1 transition-transform duration-300">
          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full border-2 border-white shadow-lg flex items-center gap-1.5">
            <Hourglass className="w-3 h-3 text-blue-200" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[7px] font-bold text-blue-200 uppercase">Coming</span>
              <span className="text-[8px] font-black uppercase">Soon</span>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}