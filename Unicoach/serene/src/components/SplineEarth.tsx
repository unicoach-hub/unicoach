import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { Sparkles, Globe2 } from 'lucide-react';

interface SplineEarthProps {
  className?: string;
  sceneUrl?: string;
  onLoad?: () => void;
}

export const SplineEarth: React.FC<SplineEarthProps> = ({
  className = '',
  sceneUrl = 'https://prod.spline.design/NTlP0o3jmzlLFxv9/scene.splinecode',
  onLoad,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative w-full h-full min-h-[350px] flex items-center justify-center overflow-visible ${className}`}>
      
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-transparent">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-indigo-600 animate-spin" />
            <Globe2 className="w-6 h-6 text-indigo-600 absolute animate-pulse" />
          </div>
          <div className="mt-3 flex items-center space-x-2 text-indigo-600 text-xs font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
            <span>LOADING 3D EARTH MODEL...</span>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="z-10 text-center p-6 text-slate-500">
          <Globe2 className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">Unable to load 3D Spline Scene</p>
        </div>
      ) : (
        /* Seamless Frame-free Circular Masked Spline Canvas Container */
        <div 
          className="relative z-10 w-full h-full pointer-events-auto flex items-center justify-center"
          style={{ 
            maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 68%)',
            WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 68%)',
            mixBlendMode: 'screen',
          }}
        >
          <Spline
            scene={sceneUrl}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      )}
    </div>
  );
};

export default SplineEarth;
