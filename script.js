const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const imageInput = document.getElementById("image-input");
const typingIndicator = document.getElementById("typing-indicator");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let message = messageInput.value.trim();

  if (!message && !imageInput.files.length) {
    alert("Please type a message or upload an image.");
    return;
  }

  appendMessage("user-message", message || "Sent an image");

  // If image is uploaded, send image first
  let imageUrl = null;
  if (imageInput.files.length > 0) {
    const formData = new FormData();
    formData.append("image", imageInput.files[0]);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (uploadData.error) {
      alert("Image upload failed: " + uploadData.error);
      return;
    }
    imageUrl = uploadData.imageUrl;
  }

  typingIndicator.style.display = "block";

  // Prepare message text to send to OpenAI (including image URL if any)
  if (imageUrl) {
    message += `\n\n[Image](${imageUrl})`;
  }

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (data.error) {
      alert("Error: " + data.error);
      typingIndicator.style.display = "none";
      return;
    }

    appendMessage("bot-message", data.reply);
  } catch (error) {
    alert("Error communicating with server");
  } finally {
    typingIndicator.style.display = "none";
    messageInput.value = "";
    imageInput.value = "";
  }
});

function appendMessage(className, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + className;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
        }
