import { Star, Heart } from 'lucide-react';
import { EarthIcon } from 'lucide-react';
import Reveal from './Reveal';

const FEATURES = [
  {
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    title: 'Koleksi Terkurasi',
    desc: 'Setiap buku dipilih dengan mempertimbangkan usia, tahap perkembangan, serta nilai edukatif yang relevan bagi anak.',
  },
  {
    icon: <EarthIcon className="w-6 h-6 text-blue-500" />,
    title: 'Koleksi Lokal & Impor Berkualitas',
    desc: 'Menghadirkan buku anak pilihan dari penerbit lokal dan internasional untuk memperkaya pengalaman membaca si kecil.',
  },
  {
    icon: <Heart className="w-6 h-6 text-pink-500" />,
    title: 'Ramah Anak',
    desc: 'Konten dan material buku diperhatikan agar sesuai untuk anak dan mendukung pengalaman belajar yang positif.',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white" id="tentang">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold text-[#8B5E3C] mb-4">
            Mengapa Memilih Akinara Books?
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="text-[#6D4C41] max-w-4xl mx-auto mb-16">
            Kami membantu orang tua memilih buku yang tepat, tanpa harus bingung,
            ragu, atau khawatir soal kualitas
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => (
            <Reveal key={idx} delay={idx * 200}>
              <div className="p-8 rounded-3xl bg-[#FFF9F0] border border-orange-50 text-center hover:shadow-xl transition-all duration-300 group cursor-default hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#8B5E3C] mb-3">{feature.title}</h3>
                <p className="text-[#6D4C41] leading-relaxed text-sm">{feature.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}