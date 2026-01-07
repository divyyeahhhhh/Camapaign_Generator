
import React from 'react';

interface BrandLogoProps {
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-1 select-none ${className}`}>
      <span className="text-[20px] font-[900] tracking-[-0.02em] text-[#F97316]">NEWGEN</span>
      <div className="relative h-7 w-4 mx-0.5">
        <div 
          className="absolute inset-0 bg-[#F97316] w-[2px] h-full left-1/2 -translate-x-1/2 rotate-[25deg]"
          style={{ transformOrigin: 'center' }}
        ></div>
      </div>
      <span className="text-[20px] font-[400] tracking-[-0.01em] text-[#52525B]">DIGITALWORKS</span>
    </div>
  );
};

export default BrandLogo;
