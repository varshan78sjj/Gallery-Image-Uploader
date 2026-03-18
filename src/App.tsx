import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Plus, Upload } from 'lucide-react';

const INITIAL_CATEGORIES = ['All'];

type ImageItem = {
  id: number;
  src: string;
  category: string;
  title: string;
};

const INITIAL_IMAGES: ImageItem[] = [];

export default function App() {
  const [images, setImages] = useState(INITIAL_IMAGES);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [filter, setFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredImages = filter === 'All' 
    ? images 
    : images.filter(img => img.category === filter);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle || !uploadCategory) return;

    const newCategory = uploadCategory.trim();
    const newImage = {
      id: Date.now(),
      src: previewUrl!,
      category: newCategory,
      title: uploadTitle.trim()
    };

    setImages(prev => [newImage, ...prev]);
    
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }

    setUploadFile(null);
    setPreviewUrl(null);
    setUploadTitle('');
    setUploadCategory('');
    setIsUploadOpen(false);
    setFilter(newCategory);
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => 
      prev === null ? null : (prev + 1) % filteredImages.length
    );
  }, [filteredImages.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => 
      prev === null ? null : (prev - 1 + filteredImages.length) % filteredImages.length
    );
  }, [filteredImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, nextImage, prevImage]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightboxIndex]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Header */}
      <header className="pt-16 pb-10 px-4 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
        >
          Gallery
        </motion.h1>
                
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Upload Image
        </motion.button>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 px-4 mb-12">
        {categories.map((category, idx) => (
          <motion.button
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            onClick={() => {
              setFilter(category);
              setLightboxIndex(null); // Reset lightbox if open
            }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              filter === category
                ? 'bg-neutral-900 text-white shadow-md'
                : 'bg-white text-neutral-600 hover:bg-neutral-200 shadow-sm'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Image Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-20">
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, index) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/3] bg-neutral-200 shadow-sm hover:shadow-xl transition-shadow duration-300"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs text-white font-medium mb-2 uppercase tracking-wider">
                      {img.category}
                    </span>
                    <h3 className="text-white text-xl font-semibold flex items-center justify-between">
                      {img.title}
                      <Maximize2 className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity delay-100" />
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredImages.length === 0 && (
          <div className="text-center py-20 text-neutral-500">
            {images.length === 0 
              ? "Your gallery is empty. Upload an image to get started!" 
              : "No images found for this category."}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button 
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-6 left-6 text-white/70 font-mono text-sm z-50 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>

            {/* Main Content */}
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12">
              
              {/* Prev Button */}
              <button
                onClick={prevImage}
                className="absolute left-4 sm:left-8 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50 transform hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>

              {/* Image Container */}
              <motion.div 
                key={lightboxIndex}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative max-w-5xl max-h-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={filteredImages[lightboxIndex].src}
                  alt={filteredImages[lightboxIndex].title}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
                <div className="w-full mt-6 text-center">
                  <h2 className="text-2xl font-semibold text-white mb-1">
                    {filteredImages[lightboxIndex].title}
                  </h2>
                  <p className="text-white/60 text-sm uppercase tracking-widest">
                    {filteredImages[lightboxIndex].category}
                  </p>
                </div>
              </motion.div>

              {/* Next Button */}
              <button
                onClick={nextImage}
                className="absolute right-4 sm:right-8 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50 transform hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsUploadOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                <h2 className="text-xl font-semibold">Upload New Image</h2>
                <button 
                  onClick={() => setIsUploadOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      previewUrl ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-sm" />
                    ) : (
                      <div className="flex flex-col items-center text-neutral-500">
                        <Upload className="w-8 h-8 mb-3 text-neutral-400" />
                        <p className="text-sm font-medium">Click to browse</p>
                        <p className="text-xs mt-1">Supports JPG, PNG, WEBP</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">Title</label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Sunset at the beach"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all"
                  />
                </div>

                {/* Category Input */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                  <input
                    id="category"
                    type="text"
                    required
                    list="category-suggestions"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    placeholder="Select or type a new category"
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all"
                  />
                  <datalist id="category-suggestions">
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!uploadFile || !uploadTitle || !uploadCategory}
                  className="w-full py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  Upload to Gallery
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
