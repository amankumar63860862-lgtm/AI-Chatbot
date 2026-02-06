const sendMessage = async () => {
  if (!input.trim()) return;  // agar input empty ho to return karo

  const userMessage = {
    id: Date.now(),
    sender: 'user',
    text: input,
    time: new Date()
  };

  // Pehle user ka message chat me add karo
  setMessages(prev => [...prev, userMessage]);
  setInput('');  // input box clear karo
  setIsTyping(true);  // typing indicator show karo

  try {
    // Backend API ko POST request bhejo
    const response = await fetch('https://your-backend-url.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage.text }),
    });

    const data = await response.json();

    // Backend se AI ka reply aaya
    const aiMessage = {
      id: Date.now() + 1,
      sender: 'ai',
      text: data.reply,
      time: new Date()
    };

    // AI message chat me add karo
    setMessages(prev => [...prev, aiMessage]);
  } catch (error) {
    // Error aane par ye message bhejo
    const errorMessage = {
      id: Date.now() + 2,
      sender: 'ai',
      text: 'Sorry, kuch problem ho gayi. Dobara try karo.',
      time: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);  // typing indicator band karo
  }
};
