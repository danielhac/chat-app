/* 
 * This is the client-side of the chat application.
 * 
 * It uses Mustache for templating the room names as a dropdown selection 
 * in the landing page.
 * 
*/

// Production
const socket = io('https://danhac-chat-app.herokuapp.com')

// Local Development
// const socket = io()

// Get all room names to display in landing page
socket.emit('getRooms', (rooms) => {
    const roomsTemplate = document.getElementById('rooms-template').innerHTML
    
    // Display active rooms dropdown selection 
    if (rooms.length) {
        const html = Mustache.render(roomsTemplate, { rooms })
        document.getElementById('join').insertAdjacentHTML('beforebegin', html)
        
        // Insert room name to field 
        document.getElementById('rooms').addEventListener('change', (e) => {
            document.getElementById('room').value = e.target.value
        })
    }
})