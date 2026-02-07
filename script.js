const chatContainer = document.getElementById("chatContainer");
const inputField = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");
const imageInput = document.getElementById("imageInput");
const clearChatButton = document.getElementById("clearChatButton");
const voiceButton = document.getElementById("voiceButton");
const darkModeToggle = document.getElementById("darkModeToggle");

const authSection = document.getElementById("authSection");
const chatSection = document.getElementById("chatSection");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

let token = localStorage.getItem("token");

// Auto login
if (token) {
  authSection.style.display = "none";
  chatSection.style.display = "block";
  loadChats();
}

// 🔐 Register
registerBtn.onclick = async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  alert("Registered! Now login.");
};

// 🔑 Login
loginBtn.onclick = async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  token = data.token;
  localStorage.setItem("token", token);

  authSection.style.display = "none";
  chatSection.style.display = "block";
  loadChats();
};

// 💬 Load chat history
async function loadChats() {
  const res = await fetch("/api/chats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const chats = await res.json();
  chatContainer.innerHTML = "";
  chats.forEach(chat => addMessageToChat(chat.role === "user" ? "User" : "Bot", chat.content));
}

// 🗑 Clear chats
clearChatButton.onclick = async () => {
  await fetch("/api/chats", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  chatContainer.innerHTML = "";
};

// 🌙 Dark mode
darkModeToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

// 💬 Add message
function addMessageToChat(sender, message, isImage = false) {
  const messageElem = document.createElement("div");
  messageElem.classList.add("message", sender.toLowerCase());

  if (isImage) {
    const img = document.createElement("img");
    img.src = message;
    img.style.maxWidth = "200px";
    messageElem.appendChild(img);
  } else {
    messageElem.textContent = message;
  }

  chatContainer.appendChild(messageElem);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 📤 Send message
sendButton.onclick = async () => {
  const userMessage = inputField.value.trim();
  if (!userMessage && !imageInput.files.length) return;

  if (userMessage) addMessageToChat("User", userMessage);

  typingIndicator.style.display = "block";

  const formData = new FormData();
  formData.append("message", userMessage);
  if (imageInput.files[0]) formData.append("image", imageInput.files[0]);

  inputField.value = "";
  imageInput.value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  typingIndicator.style.display = "none";
  addMessageToChat("Bot", data.reply);
};

// ⌨ Enter key
inputField.addEventListener("keydown", e => {
  if (e.key === "Enter") sendButton.click();
});

// 🎙 Voice input
voiceButton.onclick = () => {
  alert("Voice input feature coming soon (backend ready)!");
};
