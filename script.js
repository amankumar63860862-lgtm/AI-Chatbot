// Chat container aur input field elements ko select kar rahe hain
const chatContainer = document.getElementById('chatContainer');
const inputField = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const imageInput = document.getElementById('imageInput'); // Image upload ke liye input

// Messages ko chat window me add karne ka function
// sender = 'User' ya 'Bot', message = text ya image URL, isImage = agar image hai to true
function addMessageToChat(sender, message, isImage = false) {
  const messageElem = document.createElement('div'); // naya div banate hain message ke liye
  messageElem.classList.add('message', sender.toLowerCase()); // class add karte hain, jaise 'message user' ya 'message bot'

  if (isImage) {
    // Agar message image hai to img element create karte hain
    const img = document.createElement('img');
    img.src = message; // image URL set karte hain
    img.alt = sender + ' image'; // alt text
    img.style.maxWidth = '200px'; // image size limit karte hain
    img.style.borderRadius = '8px'; // thoda rounded corners
    messageElem.appendChild(img); // message div me image add karte hain
  } else {
    // Agar message text hai to textContent set karte hain
    messageElem.textContent = `${sender}: ${message}`;
  }

  chatContainer.appendChild(messageElem); // chat container me message add kar dete hain
  chatContainer.scrollTop = chatContainer.scrollHeight; // scroll karte hain taaki latest message dikhe
}

// Backend ko message bhejne aur bot se reply lene wali async function
async function sendMessageToBackend(message, isImage = false) {
  try {
    typingIndicator.style.display = 'block'; // Typing indicator show karte hain (bot typing dikhane ke liye)

    // Agar image bhejna hai to {image: ...}, warna {message: ...}
    const bodyData = isImage ? 
      { image: message } : 
      { message: message };

    // Backend ko POST request bhejte hain API endpoint pe
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    typingIndicator.style.display = 'none'; // Typing indicator hata dete hain jab response aa jaye

    if (!response.ok) {
      throw new Error('Network response was not ok'); // agar response galat ho to error throw karte hain
    }

    const data = await response.json(); // response ko JSON me convert karte hain
    return data.reply; // bot ka reply return karte hain
  } catch (error) {
    typingIndicator.style.display = 'none'; // error hone par bhi typing indicator hata dena
    console.error('Error sending message:', error); // console me error print karte hain
    return "Sorry, something went wrong."; // user ko error message return karte hain
  }
}

// Send button pe click hone par chalne wala code
sendButton.addEventListener('click', async () => {
  const userMessage = inputField.value.trim(); // input se user ka message lete hain aur extra spaces hata dete hain

  // Agar na to message hai na image upload hua hai to kuch nahi karna
  if (!userMessage && !imageInput.files.length) return;

  // Agar user ne text likha hai to message chat me dikhaye
  if (userMessage) {
    addMessageToChat('User', userMessage);
  }

  // Agar user ne image upload kiya hai to image file read kar ke chat me dikhaye aur backend bheje
  if (imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const reader = new FileReader();

    // Jab image file read ho jaye to ye function chalega
    reader.onload = async function(e) {
      const imageDataUrl = e.target.result; // image ko base64 data URL me convert kar lete hain
      addMessageToChat('User', imageDataUrl, true); // chat me user ki image show karte hain

      const botReply = await sendMessageToBackend(imageDataUrl, true); // backend ko image bhejte hain
      addMessageToChat('Bot', botReply); // bot ka reply chat me dikhate hain
    };

    reader.readAsDataURL(file); // image ko base64 me convert karne ke liye read karte hain
    imageInput.value = ''; // image input clear kar dete hain taaki fir upload kar saken
  } else {
    // Agar sirf text message hai to backend bhejte hain aur input clear kar dete hain
    inputField.value = '';

    const botReply = await sendMessageToBackend(userMessage);
    addMessageToChat('Bot', botReply);
  }
});

// User jab enter key dabaye to bhi message send ho jaye
inputField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendButton.click(); // Send button ka click event trigger kar dete hain
  }
});
