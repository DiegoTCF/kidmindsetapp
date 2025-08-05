import React, { useEffect, useState } from 'react';
import { removeBackground, loadImage } from '@/lib/backgroundRemoval';

interface ProcessedAvatarProps {
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const ProcessedAvatar: React.FC<ProcessedAvatarProps> = ({ 
  className = "w-12 h-12 rounded-full", 
  fallbackIcon 
}) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        setError(null);
        
        // Create image element from the uploaded image
        const response = await fetch('/lovable-uploads/ab97cd74-12bb-45a8-82f9-cbe90ce67c5e.png');
        const blob = await response.blob();
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        const url = URL.createObjectURL(processedBlob);
        
        setProcessedImageUrl(url);
      } catch (err) {
        console.error('Error processing avatar image:', err);
        setError('Failed to process image');
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup URL when component unmounts
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, []);

  if (error || (!processedImageUrl && !isProcessing)) {
    // Fallback to the original uploaded image without background removal
    return (
      <div className={className} style={{
        backgroundImage: 'url(/lovable-uploads/ab97cd74-12bb-45a8-82f9-cbe90ce67c5e.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
    );
  }

  if (isProcessing) {
    return (
      <div className={`${className} bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center animate-pulse`}>
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className={className}
      style={{
        backgroundImage: `url(${processedImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
};