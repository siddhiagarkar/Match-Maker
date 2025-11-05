const { Server } = require("socket.io");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const jwt = require("jsonwebtoken");

function setupSocket(server: any) {
    const io = new Server(server, {
        cors: { origin: "http://localhost:5173", }, // TODO: Restrict in production
    });

    // JWT authentication for all sockets
    io.use(async (socket: any, next: any) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Auth required!'));
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = payload;
            console.log("PAYLOAD - ", payload);
            next();
        } catch (err) {
            return next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: any) => {
        //if (!socket.user || !socket.user._id) {
        //    socket.disconnect();
        //    return;
        //}

        console.log('User connected:', socket.id, socket.user._id, socket.user.name);

        // Join room
        socket.on('join_conversation', async (data: any) => {

            const conversationId = data.conversationId
            if (!conversationId) return;

            // Security: only allow participant
            const conversation = await Conversation.findById(conversationId);
            if (!conversation || !(conversation.participants.map(String).includes(String(socket.user._id)))) {
                socket.emit('error', { message: 'Access denied to room.' });
                return;
            }
            socket.join(conversationId);
            socket.joinedConversations = socket.joinedConversations || [];
            if (!socket.joinedConversations.includes(conversationId)) {
                socket.joinedConversations.push(conversationId);
            }
            console.log(`Socket ${socket.id} joined room ${conversationId}`);
        });

        // Send message
        socket.on('send_message', async (data: any) => {

            const { conversationId, content } = data;
            if (
                !conversationId ||
                !content ||
                !socket.joinedConversations ||
                !socket.joinedConversations.includes(conversationId)
            ) {
                socket.emit('error', { message: 'You have not joined this conversation.' });
                return;
            }
            const conversation = await Conversation.findById(conversationId);
            if (!conversation || !(conversation.participants.map(String).includes(String(socket.user._id)))) {
                socket.emit('error', { message: 'You cannot send messages to this conversation.' });
                return;
            }
            const senderId = socket.user._id; 
            console.log('SEND_MESSAGE sender:', socket.user._id, socket.user);
            const message = await Message.create({
                conversation: conversationId,
                sender: senderId,
                content
            });

            // emit to sender for real-time feedback (optional, helps with UI consistency)
            socket.emit('receive_message', {
                _id: message._id,
                conversation: String(conversationId),
                sender: senderId,
                content,
                createdAt: message.createdAt,
            });

            // broadcast to others in room
            socket.broadcast.to(conversationId).emit('receive_message', {
                _id: message._id,
                conversation: String(conversationId),
                sender: senderId,
                content,
                createdAt: message.createdAt,
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
}

module.exports = setupSocket;
