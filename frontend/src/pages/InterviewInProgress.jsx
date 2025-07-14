import React from "react";
import { Player } from '@lottiefiles/react-lottie-player';
import voiceSphere from '/Users/visheshmamoria/Desktop/InterviewBot/frontend/src/animations/voice-sphere.json'; // Adjust path if needed
import { useMicVolume } from '../hooks/useMicVolume';

// You may want to pass 'recording' as a prop from App, for now set to true for demo
const InterviewInProgress = ({ onEnd, aiAudioUrl, aiAudioRef, onAIAudioEnded, recording, question, transcript }) => {
  const micVolume = useMicVolume(recording);
  console.log("Mic volume:", micVolume);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#101a23]">
      {/* Agent Voice Audio (hidden) */}
      {aiAudioUrl && (
        <audio
          src={aiAudioUrl}
          ref={aiAudioRef}
          autoPlay
          onEnded={onAIAudioEnded}
          style={{ display: 'none' }}
        />
      )}
      {/* Agent's Current Question */}
      <div className="text-white text-xl mb-8 px-4 text-center">
        {question}
      </div>
      {/* Voice Activity Animation */}
      <div className="flex justify-center">
        {(() => {
          const SPEAKING_THRESHOLD = 0.7;
          const isSpeaking = micVolume > SPEAKING_THRESHOLD;
          const BASE_SIZE = 300;
          const animatedSize = isSpeaking ? BASE_SIZE + micVolume * 2000 : BASE_SIZE;
          return (
            <Player
              autoplay
              loop
              src={voiceSphere}
              style={{
                height: `${animatedSize}px`,
                width: `${animatedSize}px`,
                transition: 'width 0.1s, height 0.1s'
              }}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default InterviewInProgress;
