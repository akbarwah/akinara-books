import { Star } from 'lucide-react';
import Reveal from './Reveal';

export default function Hero() {
  return (
    <section className="relative pt-28 pb-8 lg:pt-36 lg:pb-10 overflow-hidden bg-[#FFF9F0]">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E6E6FA] rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/4 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFDFC4] rounded-full blur-[80px] opacity-50 translate-y-1/4 -translate-x-1/4 animate-pulse pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <Reveal>
          <div className="inline-block mb-4 px-4 py-1.5 bg-white border border-orange-100 rounded-full shadow-sm hover:scale-105 transition-transform cursor-default">
            <span className="text-[#8B5E3C] text-sm font-semibold">
              ✨ Treasured Import & Local Children's Books
            </span>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="relative inline-block">
            {/* Decorative stars */}
            <div className="absolute -top-6 -left-8 md:-left-12 text-[#FF9E9E] animate-pulse pointer-events-none">
              <Star className="w-8 h-8 md:w-10 md:h-10 fill-current opacity-90 -rotate-12" />
            </div>
            <div className="absolute -top-2 -right-6 md:-right-10 text-yellow-400 animate-bounce pointer-events-none">
              <Star className="w-5 h-5 md:w-7 md:h-7 fill-current opacity-80 rotate-12" />
            </div>
            <div className="absolute bottom-2 -right-4 md:-right-8 text-[#9D84B7] animate-pulse pointer-events-none">
              <Star className="w-4 h-4 md:w-6 md:h-6 fill-current opacity-70" />
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-[#8B5E3C] mb-4 leading-tight relative z-10">
              Great Minds Start <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9E9E] to-[#9D84B7]">
                Between the Pages
              </span>
            </h1>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <p className="text-lg md:text-xl text-[#6D4C41] max-w-4xl mx-auto leading-relaxed">
            Explore our handpicked collection of extraordinary books, chosen to be
            the perfect companions for your little explorer's first steps into the
            magic of reading.
          </p>
        </Reveal>
      </div>
    </section>
  );
}