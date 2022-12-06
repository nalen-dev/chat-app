const socket = io();

socket.on("connect", () => {
  console.log("connected to server");
  let searchQuery = window.location.search.substring(1);
  let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, " ").replace(/=/g, '":"') + '"}');

  socket.emit("join", params, function (err) {
    if (err) {
      alert(err);
      window.location.href = "/";
    }
  });
});

socket.on("disconnect", () => {
  console.log("disconnected from server");
});

socket.on("newMessage", (message) => {
  console.log("newMessage", message);
  const template = document.querySelector("#message-template").innerHTML;
  const formatedTime = moment(message.createdAt).format("LT");

  const html = Mustache.render(template, {
    from: message.from,
    text: message.message,
    createdAt: formatedTime,
  });

  const div = document.createElement("div");
  div.innerHTML = html;

  document.querySelector("#messages").appendChild(div);
});

socket.on("updateUsersList", function (users) {
  let ol = document.createElement("ol");

  users.forEach(function (user) {
    let li = document.createElement("li");
    li.innerHTML = user;
    ol.appendChild(li);
  });

  let usersList = document.querySelector("#users");
  usersList.innerHTML = "";
  usersList.appendChild(ol);
});

socket.on("newLocationMessage", function (message) {
  console.log("newLocationMessage", message);
  const formattedTime = moment(message.createdAt).format("LT");
  console.log("newLocationMessage", message);

  const template = document.querySelector("#location-message-template").innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime,
  });

  const div = document.createElement("div");
  div.innerHTML = html;

  document.querySelector("#messages").appendChild(div);
  scrollToBottom();
});

document.querySelector("#btn-submit").addEventListener("click", function (e) {
  e.preventDefault();

  socket.emit("createMessage", { from: "User", message: document.querySelector('input[name="message"] ').value });
});

document.querySelector("#btn-sendLocation").addEventListener("click", function (e) {
  e.preventDefault();

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      socket.emit("create-locationMessage", { lat: position.coords.latitude, lng: position.coords.longitude });
    },
    function () {
      alert("Unable to fetch location.");
    }
  );
});
