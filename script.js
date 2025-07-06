const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const statusEl = document.getElementById('status');

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"; // এখানে তোমার OpenAI API কী বসাও

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'bn-BD';
recognition.interimResults = false;

let isListening = false;

micBtn.addEventListener('click', () => {
  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
});

recognition.onstart = () => {
  isListening = true;
  statusEl.textContent = 'শোনা হচ্ছে...';
  micBtn.textContent = '⏹️ বন্ধ করুন';
};

recognition.onend = () => {
  isListening = false;
  statusEl.textContent = 'অপেক্ষা করা হচ্ছে...';
  micBtn.textContent = '🎤 মাইক্রোফোন চালু করুন';
};

recognition.onerror = (event) => {
  statusEl.textContent = 'ত্রুটি: ' + event.error;
};

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  appendMessage(transcript, 'user');
  getBotResponse(transcript);
};

sendBtn.addEventListener('click', () => {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage(text, 'user');
  userInput.value = '';
  getBotResponse(text);
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});

function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  msgDiv.classList.add(sender === 'user' ? 'userMsg' : 'botMsg');
  msgDiv.textContent = text;
  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function getBotResponse(text) {
  statusEl.textContent = "AI ভাবছে...";
  appendMessage("AI ভাবছে...", 'bot');

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await res.json();

    const loadingMsg = chatbox.querySelector('.botMsg:last-child');
    if (loadingMsg && loadingMsg.textContent === 'AI ভাবছে...') {
      loadingMsg.remove();
    }

    if (data.choices && data.choices[0].message) {
      appendMessage(data.choices[0].message.content, 'bot');
      statusEl.textContent = "";
    } else {
      appendMessage('কোন উত্তর পাওয়া যায়নি।', 'bot');
      statusEl.textContent = "";
    }
  } catch (error) {
    const loadingMsg = chatbox.querySelector('.botMsg:last-child');
    if (loadingMsg && loadingMsg.textContent === 'AI ভাবছে...') {
      loadingMsg.remove();
    }
    appendMessage('ত্রুটি হয়েছে: ' + error.message, 'bot');
    statusEl.textContent = "";
  }
}
