const socket = io('https://danhac-chat-app.herokuapp.com')

// Form elements
const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.getElementsByTagName('input')[0]
const $messageFormButton = $messageForm.getElementsByTagName('button')[0]
const $messages = document.getElementById('messages')

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// Username and Room
const username = location.search.substr(1).split('&')[0].split('=')[1]
const room =     location.search.substr(1).split('&')[1].split('=')[1]

// Autoscroll
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

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msg) => {
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', e.target.elements.message.value, (acknowledge) => {
        console.log('Message delivered', acknowledge);
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
