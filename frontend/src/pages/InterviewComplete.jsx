import React from "react";

const InterviewComplete = ({ onRetake, onBackHome }) => {
  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#101a23] overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 className="text-white text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              ✅ Interview Complete!
            </h2>
            <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Thank you. Your interview has been submitted. We’ll contact you within 3–5 business days.
            </p>

            <div className="flex justify-center">
              <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3 w-full">
                <button
                  className="flex items-center justify-center rounded-xl h-10 px-4 bg-[#223649] text-white text-sm font-bold w-full"
                  onClick={onRetake}
                >
                  <span className="truncate">Retake Interview</span>
                </button>
                <button
                  className="flex items-center justify-center rounded-xl h-10 px-4 bg-[#3d98f4] text-white text-sm font-bold w-full"
                  onClick={onBackHome}
                >
                  <span className="truncate">Back to Home</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewComplete;
