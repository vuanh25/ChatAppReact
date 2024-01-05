const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1); // Exit Code 1 indicates that a container shut down, either because of an application failure.
});

const app = require("./app");

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io"); // Add this
const User = require("./models/user");
const Group = require("./models/groupChat");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then((con) => {
  console.log("DB Connection successful");
});
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

io.on("connection", async (socket) => {
  console.log(JSON.stringify(socket.handshake.query));
  const user_id = socket.handshake.query["user_id"];

  console.log(`User connected ${socket.id}`);

  if (user_id != null && Boolean(user_id)) {
    try {
      await User.findByIdAndUpdate(
        user_id,
        {
          socket_id: socket.id,
          status: "Online",
        },
        {
          new: true,
          runValidators: true,
        }
      );
    } catch (e) {
      console.log("error" + e);
    }
  }

  socket.on("create_group", async ({ groupName, members }) => {
    try {
      const newGroup = await Group.create({
        name: groupName,
        members: members,
        messages: [],
      });
      socket.join(newGroup._id);
      io.to(newGroup._id).emit("group_created", newGroup);
    } catch (error) {
      console.error(error);
    }
  });
  socket.on("text_message", async (data) => {
    console.log("Received message:", data);

    const { message, group_id, from, type } = data;

    const from_user = await User.findById(from);

    const new_message = {
      sender: from,
      type: type,
      created_at: Date.now(),
      text: message,
    };
    const chat = await Group.findById(group_id);
    chat.messages.push(new_message);

    await chat.save({ new: true, validateModifiedOnly: true });

    chat.members.forEach(async (member) => {
      const user = await User.findById(member._id).lean().select("socket_id");
      if (user && user.socket_id) {
        console.log(user.socket_id);

        io.to(user.socket_id).emit("new_message", {
          group_id,
          message: new_message,
        });
      } else {
        console.error(
          `Invalid user_id or missing socket_id for member: ${member._id}`
        );
      }
    });

    io.to(from_user?.socket_id).emit("new_message", {
      group_id,
      message: new_message,
    });
  });

  socket.on("file_message", (data) => {
    console.log("Received message:", data);
    const fileExtension = path.extname(data.file.name);

    const filename = `${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}${fileExtension}`;
  });

  socket.on("update_message", async ({ group_id, message_id, message }) => {
    try {
      const groupChat = await Group.findOneAndUpdate(
        {
          _id: group_id,
          "messages._id": message_id,
        },
        {
          $set: {
            "messages.$.text": message,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("members", "username email");

      groupChat.members.forEach(async (member) => {
        const user = await User.findById(member._id).lean().select("socket_id");

        console.log(user.socket_id);
        io.to(user.socket_id).emit("edited_message", {
          group_id,
          message: message,
        });
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("delete_message", async ({ group_id, message_id }) => {
    try {
      const groupChat = await Group.findOneAndUpdate(
        {
          _id: group_id,
        },
        {
          $pull: {
            messages: {
              _id: message_id,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("members", "username email");

      groupChat.members.forEach(async (member) => {
        const user = await User.findById(member._id).lean().select("socket_id");
        if (user && user.socket_id) {
          console.log(user.socket_id);
          io.to(user.socket_id).emit("deleted_message", {
            group_id,
            message_id,
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("kick_member", async ({ group_id, member_id }) => {
    try {
      const groupChat = await Group.findOneAndUpdate(
        {
          _id: group_id,
        },
        {
          $pull: {
            members: member_id,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("members", "username email");

      groupChat.members.forEach(async (member) => {
        const user = await User.findById(member._id).lean().select("socket_id");
        if (user && user.socket_id) {
          io.to(user.socket_id).emit("kicked_member", {
            group_id,
            member_id,
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("end", async (data) => {
    if (data.user_id) {
      await User.findByIdAndUpdate(data.user_id, { status: "Offline" });
    }

    console.log("closing connection");
    socket.disconnect(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("UNHANDLED REJECTION! Shutting down ...");
  server.close(() => {
    process.exit(1); //  Exit Code 1 indicates that a container shut down, either because of an application failure.
  });
});
