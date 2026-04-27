import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/ImageModal.css';

const ImageModal = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  // ESC tuşuna basınca kapat
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    // Body scroll'u engelle
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Kapatma Butonu */}
        <button className="image-modal-close" onClick={onClose}>
          <X size={28} />
        </button>

        {/* Ana Resim */}
        <div className="image-modal-main">
          <img 
            src={`http://82.29.168.62:5001${currentImage?.image_url || currentImage}`} 
            alt={`Resim ${currentIndex + 1}`}
          />
        </div>

        {/* Önceki Butonu */}
        {images.length > 1 && (
          <button className="image-modal-nav image-modal-prev" onClick={onPrev}>
            <ChevronLeft size={32} />
          </button>
        )}

        {/* Sonraki Butonu */}
        {images.length > 1 && (
          <button className="image-modal-nav image-modal-next" onClick={onNext}>
            <ChevronRight size={32} />
          </button>
        )}

        {/* Alt Bilgi ve Thumbnail'ler */}
        {images.length > 1 && (
          <div className="image-modal-footer">
            <div className="image-modal-counter">
              {currentIndex + 1} / {images.length}
            </div>
            <div className="image-modal-thumbnails">
              {images.map((img, idx) => (
                <div 
                  key={idx}
                  className={`thumbnail-item ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => onPrev && onPrev(idx)} // index'e gitmek için
                >
                  <img 
                    src={`http://82.29.168.62:5001${img.image_url || img}`} 
                    alt={`Küçük resim ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;