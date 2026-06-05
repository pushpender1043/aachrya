import React from 'react';

const CosmicBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 bg-[#0a0514]">
      
      {/* 1. Deep Space Base Layer */}
      <div className="absolute inset-0 nebula-gradient opacity-80" />

      {/* 2. Animated Cloud Blobs */}
      
      {/* Orange/Red Cloud */}
      <div 
        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-[float-slow_20s_infinite_ease-in-out]"
        style={{ background: 'radial-gradient(circle, rgba(255,100,100,0.8) 0%, rgba(255,70,0,0) 70%)' }}
      />

      {/* Purple/Blue Cloud */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-[float-slow_25s_infinite_ease-in-out_reverse]"
        style={{ background: 'radial-gradient(circle, rgba(120,50,255,0.8) 0%, rgba(50,0,255,0) 70%)' }}
      />

      {/* Cyan/Blue Cloud */}
      <div 
        className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[90px] opacity-30 animate-[float-fast_18s_infinite_ease-in-out]"
        style={{ background: 'radial-gradient(circle, rgba(0,200,255,0.6) 0%, rgba(0,100,255,0) 70%)' }}
      />

      {/* 3. Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} 
      />
      
    </div>
  );
};

export default CosmicBackground;