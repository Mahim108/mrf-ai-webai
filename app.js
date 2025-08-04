const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const apiSelector = document.getElementById('apiSelector');
const sendBtn = document.getElementById('sendBtn');

// Send message on button click or Enter key
sendBtn.onclick = sendMessage;
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

function appendChat(sender, text, isImage = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg ' + (sender === 'You' ? 'user' : (isImage ? 'image' : 'bot'));
  if (isImage) {
    msgDiv.innerHTML = `<strong>${sender}:</strong><br><img src="${text}" style="max-width:90%;border-radius:0.75rem;box-shadow:0 2px 12px #0003;" alt="AI Image"/>`;
  } else {
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  }
  chatDisplay.appendChild(msgDiv);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function removeLastChat() {
  if (chatDisplay.lastChild) chatDisplay.removeChild(chatDisplay.lastChild);
}

async function sendMessage() {
  const input = userInput.value.trim();
  const api = apiSelector.value;
  if (!input) return;

  appendChat('You', input);
  userInput.value = '';
  appendChat('Bot', '<span style="opacity:0.7">...thinking...</span>');

  try {
    const res = await fetch('/.netlify/functions/chatproxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, api })
    });
    const data = await res.json();
    removeLastChat();

    if (data.image_url) {
      appendChat('Bot', data.image_url, true);
    }
    if (data.reply) {
      appendChat('Bot', data.reply);
    }
    if (!data.reply && !data.image_url) {
      appendChat('Bot', 'Sorry, something went wrong.');
    }
  } catch (err) {
    removeLastChat();
    appendChat('Bot', 'Error: Unable to contact server.');
  }
}
