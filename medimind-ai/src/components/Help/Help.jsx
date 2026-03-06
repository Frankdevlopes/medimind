import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, Video, Mic, Send, User } from "lucide-react";
import "./Help.css";

const Help = ({ onBack }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "caregiver",
      text: "Hello! I am Sarah, your caregiver. How can I help you today?",
      time: "10:30 AM",
      type: "text",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() === "") return;

    // Add user message
    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputText,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text",
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate caregiver response
    setTimeout(() => {
      const caregiverResponse = {
        id: messages.length + 2,
        sender: "caregiver",
        text: "Thank you for your message. I'm here to help. Can you tell me more about what you need assistance with?",
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "text",
      };
      setMessages((prev) => [...prev, caregiverResponse]);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In real app, this would start/stop voice recording
  };

  const handleCall = () => {
    alert("Calling caregiver...");
  };

  const handleVideoCall = () => {
    alert("Starting video call...");
  };

  return (
    <div className="help-container">
      {/* Header */}
      <header className="help-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>

        <div className="caregiver-info">
          <div className="caregiver-avatar">
            <img src="/profile.jpeg" alt="Caregiver" />
            <span className="online-status"></span>
          </div>
          <div className="caregiver-details">
            <h2>Sarah Johnson</h2>
            <p className="status">Online - Caregiver</p>
          </div>
        </div>

        <div className="call-buttons">
          <button className="call-btn voice" onClick={handleCall}>
            <Phone size={20} />
          </button>
          <button className="call-btn video" onClick={handleVideoCall}>
            <Video size={20} />
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="chat-messages">
        <div className="date-divider">
          <span>Today</span>
        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === "user" ? "user-message" : "caregiver-message"}`}
          >
            {message.sender === "caregiver" && (
              <img
                src="/profile.jpeg"
                alt="Caregiver"
                className="message-avatar"
              />
            )}

            <div className="message-content">
              <div className="message-bubble">
                <p>{message.text}</p>
              </div>
              <span className="message-time">{message.time}</span>
            </div>

            {message.sender === "user" && (
              <div className="user-avatar">
                <User size={20} color="white" />
              </div>
            )}
          </div>
        ))}

        {isRecording && (
          <div className="recording-indicator">
            <div className="recording-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Recording...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-btn">I need help with my medication</button>
        <button className="quick-btn">I don't feel well</button>
        <button className="quick-btn">I forgot what to do</button>
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        <button
          className={`mic-btn ${isRecording ? "recording" : ""}`}
          onClick={toggleRecording}
        >
          <Mic size={24} />
        </button>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <button
          className={`send-btn ${inputText.trim() ? "active" : ""}`}
          onClick={handleSend}
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  );
};

export default Help;
