function Orb({ isListening, isSpeaking }) {
    return (
        <div className="orb-wrapper">
            <div
                className={`
        orb
        ${isListening ? "listening" : ""}
        ${isSpeaking ? "speaking" : ""}
        `}
            ></div>
        </div>
    );
}

export default Orb;