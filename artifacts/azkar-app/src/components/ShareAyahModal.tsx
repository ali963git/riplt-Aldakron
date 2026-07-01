import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Loader2, Image as ImageIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { SURAHS } from '../data/surahs';

interface ShareAyahModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAyahModal: React.FC<ShareAyahModalProps> = ({ isOpen, onClose }) => {
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [ayahText, setAyahText] = useState<string>('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const previewRef = useRef<HTMLDivElement>(null);

  const currentSurah = SURAHS.find(s => s.id === selectedSurahId) || SURAHS[0];

  useEffect(() => {
    // Auto fetch ayah text when surah or ayah changes
    const fetchAyah = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${selectedSurahId}:${selectedAyah}`);
        const data = await response.json();
        if (data.code === 200) {
          setAyahText(data.data.text);
        } else {
          setError('لم نتمكن من جلب الآية. تأكد من اتصالك بالإنترنت.');
        }
      } catch (err) {
        setError('حدث خطأ أثناء جلب الآية.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAyah();
  }, [selectedSurahId, selectedAyah]);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(previewRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `ayah-${selectedSurahId}-${selectedAyah}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  const handleShare = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(previewRef.current, { quality: 1, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `ayah-${selectedSurahId}-${selectedAyah}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `سورة ${currentSurah.name} - آية ${selectedAyah}`,
            text: ayahText,
            files: [file]
          });
        } catch (e) {
          console.log('Share canceled or failed', e);
        }
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Failed to share image', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold text-gray-100 font-amiri">مشاركة آية</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
            
            {/* Controls */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">السورة</label>
                <select
                  value={selectedSurahId}
                  onChange={(e) => {
                    setSelectedSurahId(Number(e.target.value));
                    setSelectedAyah(1);
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white font-amiri focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  {SURAHS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">رقم الآية</label>
                <select
                  value={selectedAyah}
                  onChange={(e) => setSelectedAyah(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  {Array.from({ length: currentSurah.verses }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-4">
                <button
                  onClick={handleDownload}
                  disabled={isLoading || !!error}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-zinc-900 py-2.5 rounded-lg font-bold hover:bg-[#F3E5AB] transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  حفظ الصورة
                </button>
                <button
                  onClick={handleShare}
                  disabled={isLoading || !!error}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white py-2.5 rounded-lg font-bold hover:bg-zinc-700 transition-colors disabled:opacity-50 border border-zinc-700"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="w-full md:w-2/3 flex items-center justify-center bg-zinc-950 rounded-xl p-4 overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm rounded-xl">
                  <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                </div>
              )}
              {error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/90 rounded-xl p-6 text-center">
                  <p className="text-red-400 font-amiri">{error}</p>
                </div>
              )}

              {/* The element to be converted to image */}
              <div 
                ref={previewRef}
                className="relative w-full aspect-square max-w-[400px] flex flex-col items-center justify-center p-8 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' // Beautiful dark teal gradient
                }}
              >
                {/* Decorative border */}
                <div className="absolute inset-3 border-2 border-[#D4AF37]/40 rounded-xl pointer-events-none"></div>
                <div className="absolute inset-4 border border-[#D4AF37]/20 rounded-lg pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  {/* Bismillah (optional, but good for design) */}
                  {selectedAyah !== 1 && selectedSurahId !== 1 && selectedSurahId !== 9 && (
                    <div className="text-[#D4AF37]/80 font-amiri text-sm mb-2">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>
                  )}

                  <p 
                    className="text-white font-amiri leading-relaxed text-2xl md:text-3xl lg:text-4xl"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                  >
                    {ayahText}
                  </p>

                  <div className="mt-8 flex flex-col items-center gap-1">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-2"></div>
                    <p className="text-[#D4AF37] font-amiri text-lg font-bold">
                      سورة {currentSurah.name}
                    </p>
                    <p className="text-gray-300 font-mono text-sm">
                      الآية {selectedAyah}
                    </p>
                  </div>
                </div>

                {/* Footer branding */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-50">
                  <span className="text-xs text-white font-amiri tracking-wider">القرآن الكريم</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
