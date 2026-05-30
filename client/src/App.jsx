import { useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
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
      if (recognitionRef.current && !recognitionActiveRef.current) {
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

      // CONTINUE LISTENING AFTER AI FINISHES
      if (isConversationActive.current && !recognitionActiveRef.current) {
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
      recognitionRef.current = new window.webkitSpeechRecognition();

      recognitionRef.current.continuous = false;

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
      // USER INTERRUPTED AI
      window.speechSynthesis.cancel();

      setIsSpeaking(false);

      const transcript = event.results[0][0].transcript;

      recognition.stop();

      // ADD USER MESSAGE
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: transcript,
        },
      ]);

      try {
        const response = await axios.post("http://localhost:5000/chat", {
          message: transcript,
        });

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

      // AUTO RESTART
      if (isConversationActive.current && event.error === "no-speech") {
        setTimeout(() => {
          startListening();
        }, 1000);
      }
    };

    // =========================
    // LISTENING ENDED
    // =========================

    recognition.onend = () => {
      console.log("Recognition Ended");

      recognitionActiveRef.current = false;

      setIsListening(false);

      // RESTART ONLY IF:
      // conversation active
      // AI NOT SPEAKING
      if (isConversationActive.current && !window.speechSynthesis.speaking) {
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
    setHasStarted(true);
    isConversationActive.current = true;

    startListening();
  };

  // =========================
  // STOP EVERYTHING
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
  <div className="app">

    {/* TOP BAR */}

    <div className="topbar">

      <div className="brand">

        <div className="brand-dot"></div>

        <div>

          <h1>
            Talk with Aditya AI
          </h1>

          <p>
            Personal AI Voice Assistant
          </p>

        </div>

      </div>

      <div className="status-pill">

        {isListening &&
          "🎤 Listening"}

        {isSpeaking &&
          "🗣 Speaking"}

        {!isListening &&
          !isSpeaking &&
          "⚡ Ready"}

      </div>

    </div>

    {/* HERO */}

    <div
      className={`hero-section ${
        hasStarted
          ? "hero-started"
          : ""
      }`}
    >

      <h2
        className={`hero-title ${
          hasStarted
            ? "hero-hidden"
            : ""
        }`}
      >
        Meet Aditya through AI
      </h2>

      <p
        className={`hero-subtitle ${
          hasStarted
            ? "hero-hidden"
            : ""
        }`}
      >

        Ask me about AI,
        projects,
        debugging,
        mindset,
        growth,
        or career journey.

      </p>

      {/* BUTTON */}

      {/* VOICE WAVE BUTTON */}

<div
  className={`voice-container ${
    hasStarted ? "move-down" : ""
  }`}
  onClick={
    !isConversationActive.current
      ? startConversation
      : stopConversation
  }
>

  {!isConversationActive.current ? (

    <div className="mic-button">

      <div className="mic-glow"></div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>

    </div>

  ) : (

    <div className="voice-wave-wrapper">

      <div className={`voice-wave ${isListening ? "active" : ""}`}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>

  )}

</div>

    </div>

    {/* CHAT */}

    <div
      className={`chat-wrapper ${
        hasStarted
          ? "chat-visible"
          : ""
      }`}
    >

      {messages.map((msg, index) => (

        <div
          key={index}
          className={`chat-row ${
            msg.sender === "user"
              ? "user-row"
              : "ai-row"
          }`}
        >

          <div
            className={`chat-bubble ${
              msg.sender === "user"
                ? "user-bubble"
                : "ai-bubble"
            }`}
          >

            <div className="chat-role">

              {msg.sender === "user"
                ? "You"
                : "Aditya AI"}

            </div>

            <div className="chat-text">
              {msg.text}
            </div>

          </div>

        </div>

      ))}

    </div>

  </div>
);
}

export default App;
