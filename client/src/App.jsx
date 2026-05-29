import Orb from "./components/Orb";
import "./styles/Orb.css";

import { useRef, useState } from "react";
import axios from "axios";

import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);

  const [isListening, setIsListening] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  const recognitionActiveRef = useRef(false);

  const isConversationActive = useRef(false);

  // =========================
  // SPEAK RESPONSE
  // =========================

  const speakResponse = (text) => {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    speech.onstart = () => {
      setIsSpeaking(true);

      // START BACKGROUND LISTENING
      if (
        recognitionRef.current &&
        !recognitionActiveRef.current
      ) {
        try {
          recognitionRef.current.start();

          recognitionActiveRef.current = true;

          setIsListening(true);
        } catch (error) {
          console.log(error);
        }
      }
    };

    speech.onend = () => {
      setIsSpeaking(false);

      // CONTINUE LISTENING
      if (
        isConversationActive.current &&
        !recognitionActiveRef.current
      ) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    window.speechSynthesis.speak(speech);
  };

  // =========================
  // START LISTENING
  // =========================

  const startListening = () => {
    // PREVENT MULTIPLE STARTS
    if (recognitionActiveRef.current) return;

    if (!recognitionRef.current) {
      recognitionRef.current =
        new window.webkitSpeechRecognition();

      // IMPORTANT FIX
      recognitionRef.current.continuous = true;

      recognitionRef.current.interimResults = false;

      recognitionRef.current.lang = "en-US";
    }

    const recognition = recognitionRef.current;

    try {
      recognition.start();

      recognitionActiveRef.current = true;

      setIsListening(true);
    } catch (error) {
      console.log(error);

      return;
    }

    // =========================
    // USER SPEAKS
    // =========================

    recognition.onresult = async (event) => {
      // USER INTERRUPTS AI
      window.speechSynthesis.cancel();

      setIsSpeaking(false);

      recognitionActiveRef.current = false;

      setIsListening(false);

      const transcript =
        event.results[event.results.length - 1][0]
          .transcript;

      // ADD USER MESSAGE
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: transcript,
        },
      ]);

      try {
        const response = await axios.post(
          "http://localhost:5000/chat",
          {
            message: transcript,
          }
        );

        // ADD AI MESSAGE
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: response.data.reply,
          },
        ]);

        // SPEAK AI RESPONSE
        speakResponse(response.data.reply);
      } catch (error) {
        console.log(error);
      }
    };

    // =========================
    // ERRORS
    // =========================

    recognition.onerror = (event) => {
      console.log("Speech Error:", event.error);

      recognitionActiveRef.current = false;

      setIsListening(false);

      // IGNORE NO SPEECH
      if (event.error === "no-speech") {
        if (isConversationActive.current) {
          setTimeout(() => {
            startListening();
          }, 1000);
        }

        return;
      }
    };

    // =========================
    // LISTENING ENDED
    // =========================

    recognition.onend = () => {
      console.log("Recognition Ended");

      recognitionActiveRef.current = false;

      setIsListening(false);

      // AUTO RESTART
      if (
        isConversationActive.current &&
        !window.speechSynthesis.speaking
      ) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };
  };

  // =========================
  // START CONVERSATION
  // =========================

  const startConversation = () => {
    isConversationActive.current = true;

    startListening();
  };

  // =========================
  // STOP CONVERSATION
  // =========================

  const stopConversation = () => {
    isConversationActive.current = false;

    window.speechSynthesis.cancel();

    setIsSpeaking(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    recognitionActiveRef.current = false;

    setIsListening(false);
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="app-container">

      {/* BACKGROUND */}

      <div className="background-glow"></div>

      {/* CENTER AREA */}

      <div className="center-area">

        {/* ORB */}

        <div
          className={`orb-wrapper ${
            isListening
              ? "listening"
              : isSpeaking
              ? "speaking"
              : ""
          }`}
        >
          <Orb
            isListening={isListening}
            isSpeaking={isSpeaking}
          />
        </div>

        {/* TITLE */}

        <div className="hero-text">
          <h1>Aditya AI</h1>

          <p>
            Your personal AI voice assistant
          </p>
        </div>

        {/* STATUS */}

        <p className="status-text">
          {isListening
            ? "Listening..."
            : isSpeaking
            ? "Speaking..."
            : "Tap the mic and start talking"}
        </p>

        {/* MIC BUTTON */}

        <button
          className={`mic-button ${
            isListening || isSpeaking
              ? "active"
              : ""
          }`}
          onClick={() => {
            if (
              isListening ||
              isSpeaking
            ) {
              stopConversation();
            } else {
              startConversation();
            }
          }}
        >
          {isListening || isSpeaking
            ? "✕"
            : "🎤"}
        </button>
      </div>

      {/* CHAT */}

      <div className="messages-container">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-row ${
              msg.sender === "user"
                ? "user-row"
                : "ai-row"
            }`}
          >
            <div
              className={`message-bubble ${
                msg.sender === "user"
                  ? "user-message"
                  : "ai-message"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}

export default App;