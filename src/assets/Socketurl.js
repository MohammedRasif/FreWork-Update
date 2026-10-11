// const baseUrl = "wss://well-anteater-happy.ngrok-free.app";
const baseUrl = "wss://api.treioferte.md";

// Modified by takmim: Read token dynamically so WebSocket always connects with valid auth token
function chat_sockit(id) {
  const token = localStorage.getItem("access_token") || "";
  const chat_ws_url = `${baseUrl}/ws/chat/${id}/?token=${token}`;
  return chat_ws_url;
}

const notification_url = () => {
  const token = localStorage.getItem("access_token") || "";
  return `${baseUrl}/ws/notifications/?token=${token}`;
};

export { notification_url, chat_sockit };
