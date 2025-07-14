import React from "react";

const VoiceInterviewWelcome = ({ onAgree }) => {
  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#101a23] overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <div className="w-full" style={{ height: "100px" }}></div>
            <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Welcome to Your Voice Interview 🎙️
            </h2>
            <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              This interview is voice-based and will take 10–15 minutes. Your voice will be recorded.
            </p>
            <div className="flex px-4 py-3 justify-center">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#3d98f4] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                onClick={onAgree}
              >
                <span className="truncate">I Agree</span>
              </button>
            </div>
            {/* <p className="text-[#90adcb] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Powered by XYZ
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterviewWelcome;
