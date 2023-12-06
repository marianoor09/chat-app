import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [currentUser, setCurrentUser] = useState({ id: 'user1' });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(true);
    };

    const updateOfflineStatus = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOfflineStatus);

    socket.on('chat message', (msg) => {
      const isCurrentUserMessage = msg.senderId === currentUser.id;
      const channel = isCurrentUserMessage ? 'channel1' : 'channel2';
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: channel, text: msg.text, index: prevMessages.length },
      ]);
    });

    return () => {
      socket.off('chat message');
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOfflineStatus);
    };
  }, []);

  const sendMessage = () => {
    if (isOnline && message.trim() !== '') {
      socket.emit('chat message', { text: message, senderId: currentUser.id });
      setMessage('');
    }else {
      if (!isOnline) {
        alert('Internet connection is lost. Unable to send message.');
      } else if (message.trim() === '') {
        alert('Message cannot be empty.');
      }
    }
  };

  const combinedMessages = [...messages].sort((a, b) => a.index - b.index);

  return (
    <div style={chatContainerStyle}>
      <div style={messageContainerStyle}>
        {combinedMessages.map((msg, index) => {
          const isChannel1 = msg.id === 'channel1';
          const messageStyleToApply = isChannel1 ? messageStyle1 : messageStyle;

          return (
            <div key={index} style={{ ...messageStyleToApply, alignSelf: isChannel1 ? 'flex-start' : 'flex-end' }}>
              {msg.text}
            </div>
          );
        })}
      </div>
      <div style={inputContainerStyle}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={inputStyle}
          disabled={!isOnline}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} style={buttonStyle} disabled={!isOnline}>
          Send
        </button>
      </div>
    </div>
  );
}

const chatContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '97vh',
  padding: '10px',
  boxSizing: 'border-box',
};

const messageContainerStyle = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const messageStyle = {
  marginBottom: '8px',
  padding: '10px',
  borderRadius: '8px',
  background: '#25D366',
  color: '#fff',
  maxWidth: '70%',
};

const messageStyle1 = {
  ...messageStyle,
  background: '#e0e0e0',
  color: '#000',
};

const inputContainerStyle = {
  display: 'flex',
  marginTop: '10px',
};

const inputStyle = {
  flex: 1,
  marginRight: '10px',
  padding: '10px',
  fontSize: '16px',
  borderRadius: '8px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '10px 16px',
  fontSize: '16px',
  borderRadius: '8px',
  background: '#25D366',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
};

export default App;
