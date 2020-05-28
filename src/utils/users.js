// All users from all rooms
const users = []

// Add a user
const addUser = ({ id, username, room }) => {
    if (!username || !room) {
        return { error: 'Username and room are required' }
    }
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Check for existing user
    const existingUser = users.find((user) => {
        return (user.room === room) && (user.username === username)
    })

    // Validate username
    if (existingUser) {
        return { error: 'Username is in use!' }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// Removes a user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// Get a user
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// Get all users within a particular room
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

// Get all rooms by obtaining room property in users array
const getAllRooms = () => {
    const rooms = []
    users.forEach(user => {
        if (!rooms.includes(user.room)) {
            rooms.push(user.room)
        }
    });
    return rooms
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getAllRooms
}