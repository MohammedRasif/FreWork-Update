const baseUrl = "ws://10.10.13.59:8008";
const token = localStorage.getItem("access_token");
const notification_url = `${baseUrl}/ws/notifications/?token=${token}`;
function chat_sockit(id) {
  const chat_ws_url = `${baseUrl}/ws/chat/${id}/?token=${token}`;
  return chat_ws_url;
}
export { notification_url, chat_sockit };
