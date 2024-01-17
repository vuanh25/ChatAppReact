const mongoose = require("mongoose");
const dotenv = require("dotenv");
const shortid = require("shortid");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1); // Exit Code 1 indicates that a container shut down, either because of an application failure.
});

const app = require("./app");
const socketioJwt = require("socketio-jwt");

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
  console.log("Database connection successful");
});
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

io.use(
  socketioJwt.authorize({
    secret: process.env.JWT_SECRET,
    handshake: true,
    callback: false,
  })
);

io.on("connection", async (socket) => {
  const user_id = socket.decoded_token.userId;
  if (!user_id) {
    socket.emit("not_authenticated", { message: "Bạn chưa đăng nhập." });

    socket.disconnect();
    return;
  }

  console.log(`User connected: ${socket.id}`);

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

  socket.on("create_group", async ({ groupName, publicGroup }) => {
    try {
      const hostUser = await User.findById(user_id);
      const shortGroupId = shortid.generate();
      const newGroup = await Group.create({
        name: groupName,
        host: user_id,
        groupId: shortGroupId,
        members: [hostUser],
        public: publicGroup,
        messages: [],
      });
      socket.join(newGroup._id);
      io.to(newGroup._id).emit("group_created", newGroup);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("find_group", async ({ groupId }) => {
    try {
      const groupChat = await Group.findOne({ groupId: groupId });
      const host = groupChat.host;
      const from_user = await User.findById(host);
      const currentuser = await User.findById(user_id);
      if (
        groupChat.public == false &&
        groupChat.members.includes(user_id) == false
      ) {
        if (groupChat.request.includes(user_id) == true) {
          io.to(currentuser.socket_id).emit(
            "group_found",
            "Bạn đã gửi yêu cầu tham gia nhóm"
          );
        } else {
          const request = await Group.findByIdAndUpdate(
            groupChat._id,
            { $push: { request: user_id } },
            { new: true }
          );
          io.to(from_user?.socket_id).emit("request_group", request);
        }
      } else if (
        groupChat.public == false &&
        groupChat.members.includes(user_id) == true
      ) {
        socket.join(groupChat._id);
        io.to(from_user.socket_id).emit( "group_found",
          "User:  " + user_id + "vào phòng"
        );
      } else if (
        groupChat.public == true &&
        groupChat.members.includes(user_id) == false
      ) {
        const new_member = Group.findByIdAndUpdate(
          { groupId: groupId },
          { $push: { members: user_id } },
          { new: true }
        );
        io.to(groupChat._id).emit("new_member", new_member);
      } else if (
        groupChat.public == true &&
        groupChat.members.includes(user_id) == true
      ) {
        socket.join(groupChat._id);
        io.to(groupChat._id).emit("group_found", groupChat);
      }

      io.to(currentuser.socket_id).emit(
        "group_notfound",
        "Không tìm thấy nhóm"
      );
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("accept_request", async ({ group_id, member_id }) => {
    try {
      const groupChat = await Group.findOneAndUpdate(
        {
          groupId: group_id,
        },
        {
          $push: {
            members: member_id,
          },
          $pull: {
            request: member_id,
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
          io.to(user.socket_id).emit("accepted_request", {
            group_id,
            member_id,
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("text_message", async (data) => { 
    const { message, groupId, from, type } = data;
    const from_user = await User.findById(from);
    const user = { 
      fullname: from_user.fullname, 
      about: from_user.about, 
      avatar: from_user.avatar, 
      email: from_user.email
    };    

    const currentTime = new Date();
    const pubDate = `${currentTime.getHours()}:${currentTime.getMinutes()} ${currentTime.getDate()}/${currentTime.getMonth() + 1}/${currentTime.getFullYear()}`;

    const new_message = {
      sender: from,
      type: type,
      created_at: Date.now(),
      text: message,
      pubDate: pubDate,
      fullname: user.fullname,
      avatar: user.avatar
    };
    const chat = await Group.findOne({groupId: groupId});
    chat.messages.push(new_message);

    await chat.save({ new: true, validateModifiedOnly: true });
 
    chat.members.forEach(async (member) => {
      const user = await User.findById(member._id).lean().select("socket_id");
      if (user && user.socket_id) {

        io.to(user.socket_id).emit("new_message", {
          group_id: groupId,
          message: new_message,
        });
      } else {
        console.error(
          `Invalid user_id or missing socket_id for member: ${member._id}`
        );
      }
    });
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
          console.log("12345");
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
      const group = await Group.findOne({ groupId: group_id });
      if (user_id != group.host) {
        io.to(user_id).emit("not_host", {
          group_id,
          message: "Bạn không phải chủ phòng",
        });
        return;
      } else {
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
          const user = await User.findById(member._id)
            .lean()
            .select("socket_id");
          if (user && user.socket_id) {
            io.to(user.socket_id).emit("kicked_member", {
              group_id,
              member_id,
            });
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("leave_group", async ({ group_id, member_id }) => {
    try {
      const groupChat = await Group.findOneAndUpdate(
        { _id: group_id },
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
        const user = await User.findById(member._id)
          .lean()
          .select("socket_id");
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
