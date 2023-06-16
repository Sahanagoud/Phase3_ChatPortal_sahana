const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
app.use(cors());

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true // Optional: Allow sending cookies with Socket.io requests
  }
});

app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies


mongoose.connect('mongodb://127.0.0.1:27017/chat_portal', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const messageSchema = new mongoose.Schema({
  user: String,
  content: String,
  roomId: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('user', userSchema);

const joinedUserSchema = new mongoose.Schema({
  username: String, 
  chatRoom: {
    type: String   
  }
});

const joinedUser = mongoose.model('joinedUser', joinedUserSchema);


async function getJoinedUsers(chatRoom,username) {
  try {
    console.log("room " + chatRoom);
    const joinedUsers = await joinedUser.find({chatRoom: chatRoom}, 'username');
    console.log("joined: " + joinedUsers);
    const usernames = joinedUsers.map(joinedUser => joinedUser.username);
    return usernames;
  } catch (error) {
    console.error('Error retrieving joined users:', error);
    throw error;
  }
}
io.on('connection', async(socket) => {
  console.log('User connected');
  const username = socket.handshake.query.username;
  const chatRoom = socket.handshake.query.chatRoom;
  
await joinedUser.deleteMany({ username: username, chatRoom: chatRoom });

 const joineduser = new joinedUser({ username: username, chatRoom: chatRoom });
 joineduser.save()
   .then(() => {
     console.log(username + ' User joined successfully');    
     socket.join(chatRoom); 
     socket.broadcast.to(chatRoom).emit('userJoined', username);
   })
   .catch(error => {
     console.error('Error joining user:', error);
   });

  try {
    const joinedUsers = await getJoinedUsers(chatRoom);
    console.log(joinedUsers)
    socket.emit('joinedUsers', joinedUsers);
   
  } catch (error) {
    console.error('Error retrieving joined users:', error);
  }
  
  socket.on('newMessage', (message) => {
    const newMessage = new Message({
      user: message.user,
      content: message.content
    });    
    io.emit('newMessage', newMessage);

  });

  socket.on('leaveChatRoom', async () => {
    socket.leave(chatRoom);
    console.log(`${username} left chat room: ${chatRoom}`);
    await joinedUser.deleteMany({ username: username, chatRoom: chatRoom });
    socket.join(chatRoom); 
    socket.broadcast.to(chatRoom).emit('userLeft', username);

    
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');    
  });
});

// Register route
app.post('/register', (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  bcrypt.hash(password, 10)
    .then((hashedPassword) => {
      const newUser = new User({
        username,
        password: hashedPassword
      });

      newUser.save()
        .then(() => {
          res.status(201).json({ message: 'User registered successfully' });
        })
        .catch((error) => {
          console.error('Error registering user:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
    })
    .catch((error) => console.error('Error hashing password'));
});


// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: 'Invalid username or password' });
      } else {
        bcrypt.compare(password, user.password)
          .then((match) => {
            if (!match) {
              res.status(401).json({ error: 'Invalid username or password' });
            } else {
              const token = jwt.sign({ username }, 'secret-key', { expiresIn: '1h' });
              res.status(200).json({ token: token, username: username });
            }
          })
          .catch((error) => {
            console.error('Error comparing passwords:', error);
            res.status(500).json({ error: 'Internal server error' });
          });
      }
    })
    .catch((error) => {
      console.error('Error finding user:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});


app.get('/chat-rooms', (req, res) => {
  const chatRooms = [
    'Music',
    'Art',
    'Dance'
  ];

  res.json({ chatRooms });
});


app.get('/chat-rooms/:roomId', async (req, res) => {
  console.log("gett")
  const roomId = req.params.roomId;
  console.log(roomId);

  try {
    const messages = await Message.find({ roomId: roomId });
    res.json({chatMessages: messages});
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});


app.post('/chat-rooms/:roomId/messages', async (req, res) => {
  const roomId = req.params.roomId;
  const { content, user } = req.body;
  console.log(req.body);

  try {
    const message = new Message({
      roomId: roomId,
      content: content,
      user: user
    });

    await message.save();

    res.json({chatMessages: message});
  } catch (error) {
    console.error('Error storing message:', error);
    res.status(500).json({ error: 'Failed to store message' });
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
