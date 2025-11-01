const { Server } = require("socket.io");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const jwt = require("jsonwebtoken");

function setupSocket(server: any) {
    const io = new Server(server, {
        cors: {
            origin: "*", // Configure for production as needed
        },
    });


    // IMPLEMENT JWT AUTHENTICATION FOR SOCKETS [!!!]

    //// JWT auth for Socket.IO
    //io.use(async (socket: any, next: any) => {
    //    const token = socket.handshake.auth?.token;
    //    if (!token) return next(new Error('Auth required!'));

    //    try {
    //        const payload = jwt.verify(token, process.env.JWT_SECRET);
    //        socket.user = payload; // store user info on socket
    //        next();
    //    } catch (err) {
    //        return next(new Error('Invalid token'));
    //    }
    //});


    io.on('connection', (socket: any) => {

        console.log('User connected:', socket.id);

        socket.on('join_conversation', async (data: any) => {
            // Check: user should be member of conversation
            const { conversationId } = data;

            socket.join(conversationId);

            // Keep track of joined conversations
            socket.joinedConversations = socket.joinedConversations || [];
            socket.joinedConversations.push(conversationId);

            console.log(`Socket ${socket.id} (${socket.id}) joined room ${conversationId}`);
        });

        // Listen for new messages
        socket.on('send_message', async (data: any) => {
            // Sender is always from JWT user
            //const sender = socket.id;
            const { sender, conversationId, content } = data;

            if (socket.joinedConversations == null || !socket.joinedConversations.includes(conversationId)) {
                socket.emit('error', { message: 'You have not joined this conversation.' });
                return;
            }

            //// Verify sender is participant of conversation
            //const conversation = await Conversation.findById(conversationId);
            //if (!conversation || !(conversation.participants || []).includes(sender)) {
            //    socket.emit('error', { message: 'You cannot send messages to this conversation.' });
            //    return;
            //}

            // Save to DB
            const message = await Message.create({
                conversation: conversationId,
                sender,
                content
            });

            // Only broadcast if valid
            socket.broadcast.to(conversationId).emit('receive_message', {
                _id: message._id,
                conversation: conversationId,
                sender,
                content,
                createdAt: message.createdAt
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
}

module.exports = setupSocket;
