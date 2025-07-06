const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const statusEl = document.getElementById('status');

// তোমার OpenAI API Key এখানে বসাও
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";

// মেসেজ অ্যাপেন্ড করার ফাংশন
function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  msgDiv.classList.add(sender === 'user' ? 'userMsg' : 'botMsg');
  msgDiv.textContent = text;
  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// AI থেকে রেসপন্স আনার ফাংশন
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

    // আগের 'AI ভাবছে...' মেসেজ মুছে ফেলা
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

// সেন্ড বাটনে ক্লিক ইভেন্ট
sendBtn.addEventListener('click', () => {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage(text, 'user');
  userInput.value = '';
  getBotResponse(text);
});

// এন্টার প্রেস করলে পাঠানো হবে
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});
