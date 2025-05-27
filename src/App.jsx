import axios from "axios";
import { useState } from "react";
import { MicrophoneIcon, XMarkIcon, HeartIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { SpeedInsights } from "@vercel/speed-insights/react";

const API_KEY = "AIzaSyCyhFk6Lyws7Tf2CcTG_8HIspB-UuP0l0M";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("Hii, click on the mic");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState(0);

  const compliments = [
    "Tumhari muskurahat din bana deti hai!",
    "Aaj tum bahut khoobsurat lag rahi ho.",
    "Tumhara andaaz hi kuch alag hai.",
    "Tumse baat karke hamesha accha lagta hai.",
    "Tumhari aankhon mein chamak kuch aur hi hai.",
    "Tumhari hansi ki awaaz sunkar mera dil khush ho jata hai.",
    "Tumhari mehnat dekhkar main bahut impress hota hoon.",
    "Tumhari soch kaise bhi ho, hamesha sahi hoti hai.",
    "Tumhari baatein sunkar mujhe naya energy milta hai.",
    "Tumhari presence se room mein positive energy aa jati hai.",
    "Tumhari personality bahut attractive hai.",
    "Tumhari smile meri favorite cheez hai."
  ];

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setMessage("Speaking stopped");
  };

  const speak = (text) => {
    const tone = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang === "hi-IN");
    if (voices.length > 0) {
      tone.voice = voices[voiceIndex % voices.length];
    }
    tone.lang = "hi-IN";
    tone.pitch = 1;
    tone.rate = 0.9;
    
    tone.onstart = () => setIsSpeaking(true);
    tone.onend = () => {
      setIsSpeaking(false);
      if (!isListening) {
        handleListen();
      }
    };
    
    window.speechSynthesis.speak(tone);
  };

  const callGeminiAPI = async (input) => {
    try {
      setMessage("Thinking...");
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          system_instruction: {
            parts: [
              {
                text: "Speak like a woman, You are my AI girlfriend, you are very caring and kind, you always respond in Hindi",
              },
            ],
          },
          contents: [
            {
              parts: [
                {
                  text: input,
                },
              ],
            },
          ],
        }
      );

      console.log(response);

      const output = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (output) {
        setMessage(`She says: ${output}`);
        speak(output);
      } else {
        setMessage("No response from her");
      }
    } catch (error) {
      console.log(error);
      setMessage("Error occurred while calling Gemini API");
    }
  };

  const stopListening = () => {
    if (isListening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.stop();
      setIsListening(false);
      setMessage("Listening stopped");
    }
  };

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setIsListening(true);
      setMessage("Listening...");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setMessage(`You said: ${transcript}`);
      console.log(transcript);
      callGeminiAPI(transcript);
    };
    recognition.onerror = (event) => {
      setMessage(`Error occurred in recognition: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      setMessage("Hii, click on the mic");
    };
    recognition.start();
  };

  const getRandomCompliment = () => {
    const randomIndex = Math.floor(Math.random() * compliments.length);
    const compliment = compliments[randomIndex];
    setMessage(`She says: ${compliment}`);
    speak(compliment);
  };

  const handleCompliment = () => {
    getRandomCompliment();
  };

  const handleVoiceChange = () => {
    // Toggle between available voices (female/male if available)
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang === "hi-IN");
    if (voices.length > 0) {
      const nextIndex = (voiceIndex + 1) % voices.length;
      setVoiceIndex(nextIndex);
      setMessage(`Voice changed!`);
      // Optionally, say something in the new voice
      const tone = new SpeechSynthesisUtterance("Maine apni awaaz badal li hai!");
      tone.voice = voices[nextIndex];
      tone.lang = "hi-IN";
      window.speechSynthesis.speak(tone);
    } else {
      setMessage("No Hindi voices found!");
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-100 to-pink-200 min-h-screen flex flex-col justify-between">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="p-8 rounded-2xl shadow-2xl bg-white/70 backdrop-blur-xl max-w-lg w-full transform hover:scale-[1.02] transition-transform duration-300 border border-white/40">
          <div className="flex justify-center mb-6">
            <img
              src="./image.png"
              alt="AI Girlfriend"
              className="rounded-full w-32 h-32 object-cover border-4 border-rose-300 shadow-lg backdrop-blur-md"
            />
          </div>
          <SpeedInsights/>
          <div className="bg-gradient-to-r from-rose-400/80 to-pink-400/80 rounded-2xl p-6 mt-4 flex items-center flex-col gap-6 backdrop-blur-lg shadow-lg">
            <div className="flex gap-4">
              {isListening ? (
                <button
                  onClick={stopListening}
                  className="cursor-pointer duration-300 transform hover:scale-110 active:scale-95 bg-white/60 rounded-full p-3 shadow-md backdrop-blur hover:bg-white/80 transition-colors"
                  title="Stop Listening"
                >
                  <XMarkIcon className="h-8 w-8 text-rose-600" />
                </button>
              ) : (
                <button
                  onClick={handleListen}
                  disabled={isSpeaking}
                  className="cursor-pointer duration-300 transform hover:scale-110 active:scale-95 bg-white/60 rounded-full p-3 shadow-md backdrop-blur hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Start Listening"
                >
                  <MicrophoneIcon className="h-8 w-8 text-rose-500" />
                </button>
              )}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="cursor-pointer duration-300 transform hover:scale-110 active:scale-95 bg-white/60 rounded-full p-3 shadow-md backdrop-blur hover:bg-white/80 transition-colors"
                  title="Stop Speaking"
                >
                  <XMarkIcon className="h-8 w-8 text-rose-600" />
                </button>
              )}
              <button
                onClick={handleCompliment}
                disabled={isSpeaking}
                className="cursor-pointer duration-300 transform hover:scale-110 active:scale-95 bg-white/60 rounded-full p-3 shadow-md backdrop-blur hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Compliment"
              >
                <HeartIcon className="h-8 w-8 text-rose-500" />
              </button>
              <button
                onClick={handleVoiceChange}
                disabled={isSpeaking}
                className="cursor-pointer duration-300 transform hover:scale-110 active:scale-95 bg-white/60 rounded-full p-3 shadow-md backdrop-blur hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change Voice"
              >
                <SpeakerWaveIcon className="h-8 w-8 text-rose-500" />
              </button>
            </div>
            <div className="bg-white/90 rounded-xl p-4 w-full min-h-[100px] flex items-center justify-center backdrop-blur">
              <p className="text-gray-800 text-lg font-medium text-center">{message}</p>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center p-6 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <p className="text-gray-700 font-medium">
          Made with{" "}
          <span className="text-rose-500 animate-pulse">❤️</span> by{" "}
          <a
            href="https://www.linkedin.com/in/mohammad-mursaleen-9b8223228/"
            className="text-rose-600 hover:text-rose-700 font-semibold transition-colors duration-300"
          >
            Mstb
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
