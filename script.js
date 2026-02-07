function addMessageToChat(sender, message) {
  const chatContainer = document.getElementById('chatContainer');
  const messageElem = document.createElement('div');
  messageElem.classList.add('message');
  messageElem.classList.add(sender.toLowerCase());
  messageElem.textContent = `${sender}: ${message}`;
  chatContainer.appendChild(messageElem);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessageToBackend(message) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error sending message:', error);
    return "Sorry, something went wrong.";
  }
}

document.getElementById('sendButton').addEventListener('click', async () => {
  const inputField = document.getElementById('messageInput');
  const userMessage = inputField.value.trim();

  if (!userMessage) return;

  addMessageToChat('User', userMessage);

  inputField.value = '';

  const botReply = await sendMessageToBackend(userMessage);

  addMessageToChat('Bot', botReply);
});
