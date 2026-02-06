document.getElementById("send-btn").addEventListener("click", sendMessage);

function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");

  const userDiv = document.createElement("div");
  userDiv.className = "message user";
  userDiv.textContent = "You: " + message;
  chatBox.appendChild(userDiv);

  const botDiv = document.createElement("div");
  botDiv.className = "message bot";
  botDiv.textContent = "AI: Demo reply.";
  chatBox.appendChild(botDiv);

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}
