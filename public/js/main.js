const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const rommName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join Chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
  // emit 으로 보낸 메시지를 on으로 받는거임
  console.log(message); // Welcome to LangB Chat Room
  outputMessage(message);
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  // e stands for event
  e.preventDefault(); // literally prevent default behavior

  // Get message text
  const msg = e.target.elements.msg.value; // userinput text

  //   console.log(msg); // get the message from the text input

  // Emit message to server
  socket.emit("chatMessage", msg);

  // Scroll Down
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus(); // after sending, the cursor is on input div
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text} 
  </p>`;
  // here, the {message} is in object type
  document.querySelector(".chat-messages").appendChild(div); // whenever a new message is created, a new message div is created
}

// Add room name to DOM
function outputRoomName(room) {
  rommName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
}
