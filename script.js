const socket = io();

function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;
  socket.emit("chat message", { user: username, text: message });
  input.value = "";
}

const messagesDiv = document.getElementById("messages");
socket.on("chat message", ({ user, text }) => {
  const el = document.createElement("div");
  el.innerHTML = `<strong>${user}:</strong> ${text}`;
  messagesDiv.appendChild(el);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
