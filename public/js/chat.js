/* 
 * This is the client-side of the chat application.
 * 
 * It uses Mustache for templating the usernames and room on the side bar and
 * username, messages, and timestamp for the chat area.
 * 
*/

// Production
const socket = io('https://danhac-chat-app.herokuapp.com')

// Local Development
// const socket = io()

// Form elements
const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.getElementsByTagName('input')[0]
const $messageFormButton = $messageForm.getElementsByTagName('button')[0]
const $messages = document.getElementById('messages')

// Templates for Mustache
const messageTemplate = document.getElementById('message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// Username and Room
const username = location.search.substr(1).split('&')[0].split('=')[1]
const room =     location.search.substr(1).split('&')[1].split('=')[1]

// Autoscroll feature
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // Distance from where user scrolled and the visible height
    const scrollOffset = $messages.scrollTop + visibleHeight

    // Auto scrolls if at bottom of chat area
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Renders the message, username and timestamp
socket.on('message', (msg) => {
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// Renders room name and all users
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html
})

// Event listener for client-side send message button in a room
// Calls function to send message from the message input field
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', e.target.elements.message.value, (acknowledge) => {
        console.log(acknowledge);
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })
})

// Calls server-side to join a room using info on client-side
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
    
    // Callback will remove loaders and display main body
    document.getElementById('loader').style.display = 'none'
    document.getElementById('loader-text').style.display = 'none'
    document.getElementsByClassName('chat')[0].style.display = 'flex'
})