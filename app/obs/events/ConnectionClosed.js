module.exports = (socket) => {
    socket.connect(socket.driver, socket.app);
}