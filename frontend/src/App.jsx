import { useRef, useState } from 'react';
import './App.css';
import VoiceInterviewWelcome from "./pages/VoiceInterviewWelcome.jsx";
import InterviewInProgress from "./pages/InterviewInProgress.jsx";
import InterviewComplete from "./pages/InterviewComplete.jsx";

function App() {
  const [conversationMode, setConversationMode] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [turn, setTurn] = useState(0);

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [language, setLanguage] = useState('hi');
  const [loading, setLoading] = useState(false);
  const [aiAudioUrl, setAiAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const aiAudioRef = useRef(null);

  const [phase, setPhase] = useState("welcome");

  // Start recording
  const startRecording = async () => {
    if (conversationMode && !conversationActive) return;

    setRecording(true);
    setAudioUrl(null);
    setTranscript('');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setLoading(true);
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      try {
        const fakeTranscript = 'नमस्ते, मेरा नाम अमित है।';
        setTranscript(fakeTranscript);
        const res2 = await fetch('http://localhost:8000/interview/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: fakeTranscript, language }),
        });
        const data2 = await res2.json();
        setQuestion(fakeTranscript);
        setAnswer(data2.response);

        const res3 = await fetch('http://localhost:8000/api/audio/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data2.response, language }),
        });
        const data3 = await res3.json();
        setAiAudioUrl(data3.audio_url);
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current && mediaRecorderRef.current.stop();
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startConversation = async () => {
    setConversationMode(true);
    setConversationActive(true);
    setTurn(0);
    setTranscript("");
    setQuestion("");
    setAnswer("");
    setAudioUrl(null);
    setAiAudioUrl(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/interview/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '', language })
      });
      const data = await res.json();
      setAnswer(data.response);

      const res2 = await fetch('http://localhost:8000/api/audio/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.response, language })
      });
      const data2 = await res2.json();
      setAiAudioUrl(data2.audio_url);

      setTimeout(() => {
        if (aiAudioRef.current) {
          aiAudioRef.current.play();
        }
      }, 300);
    } catch (err) {
      alert('Error starting conversation: ' + err.message);
      setConversationMode(false);
      setConversationActive(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAudioEnded = async () => {
    if (!conversationMode || !conversationActive) return;
    setTimeout(() => {
      autoStartRecording();
    }, 400);
  };

  const autoStartRecording = async () => {
    setRecording(true);
    setAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const mediaRecorder = new window.MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setLoading(true);
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');
        try {
          const transRes = await fetch('http://localhost:8000/api/audio/transcribe', {
            method: 'POST',
            body: formData
          });
          const transData = await transRes.json();
          setTranscript(transData.transcript);

          const res2 = await fetch('http://localhost:8000/interview/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: transData.transcript, language })
          });
          const data2 = await res2.json();
          setQuestion(transData.transcript);
          setAnswer(data2.response);

          const res3 = await fetch('http://localhost:8000/api/audio/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data2.response, language })
          });
          const data3 = await res3.json();
          setAiAudioUrl(data3.audio_url);
          setTurn(t => t + 1);

          setTimeout(() => {
            if (aiAudioRef.current) {
              aiAudioRef.current.play();
            }
          }, 300);
        } catch (err) {
          alert('Error: ' + err.message);
          setConversationMode(false);
          setConversationActive(false);
        } finally {
          setLoading(false);
        }
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setRecording(false);
        }
      }, 10000);
    } catch (err) {
      alert('Could not access microphone: ' + err.message);
      setConversationMode(false);
      setConversationActive(false);
    }
  };

  const stopConversation = () => {
    setConversationMode(false);
    setConversationActive(false);
    setRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const sendToInterview = async (msg) => {
    setLoading(true);
    const res = await fetch('http://localhost:8000/interview/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg || transcript, language }),
    });
    const data = await res.json();
    setQuestion(msg || transcript);
    setAnswer(data.response);
    setLoading(false);
  };

  const handleAgree = () => {
    setPhase("interview");
    startConversation();
  };

  const handleEndInterview = () => {
    stopConversation();
    setPhase("complete");
  };

  const handleBackHome = () => {
    setPhase("welcome");
    setConversationMode(false);
    setConversationActive(false);
    setTurn(0);
    setRecording(false);
    setAudioUrl(null);
    setTranscript("");
    setQuestion("");
    setAnswer("");
    setAiAudioUrl(null);
  };

  const handleRetake = () => {
    setPhase("interview");
    startConversation();
  };

  // Render appropriate phase
  if (phase === "welcome") {
    return <VoiceInterviewWelcome onAgree={handleAgree} />;
  }

  if (phase === "interview") {
    return (
      <InterviewInProgress
        onEnd={handleEndInterview}
        aiAudioUrl={aiAudioUrl}
        aiAudioRef={aiAudioRef}
        onAIAudioEnded={handleAIAudioEnded}
        recording={recording}
        question={answer}
        transcript={transcript}
      />
    );
  }

  if (phase === "complete") {
    return <InterviewComplete onRetake={handleRetake} onBackHome={handleBackHome} />;
  }

  return null;
}

export default App;
