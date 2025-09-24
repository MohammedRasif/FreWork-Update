const baseUrl = "wss://well-anteater-happy.ngrok-free.app";
const token = localStorage.getItem("access_token");
const notification_url = `${baseUrl}/ws/notifications/?token=${token}`;
function chat_sockit(id) {
  const chat_ws_url = `${baseUrl}/ws/chat/${id}/?token=${token}`;
  return chat_ws_url;
}
export { notification_url, chat_sockit };
