

const startStopBtn = document.getElementById('start-stop-btn');
const clearHistoryBtn = document.getElementById('clear-history');
const statusEl = document.getElementById('status');
const responseText = document.getElementById('response-text');
const historyEl = document.getElementById('history');
const toggleModeBtn = document.getElementById('toggle-mode');
const languageSelect = document.getElementById('language');

const huggingFaceApiKey = "    ";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.lang = languageSelect.value;

let isListening = false;

toggleModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

languageSelect.addEventListener('change', () => {
  recognition.lang = languageSelect.value;
  statusEl.textContent = `ভাষা পরিবর্তন করা হয়েছে: ${languageSelect.options[languageSelect.selectedIndex].text}`;
});

startStopBtn.addEventListener('click', () => {
  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
});

recognition.onstart = () => {
  isListening = true;
  statusEl.textContent = 'শোনা হচ্ছে...';
  startStopBtn.textContent = '⏹️ কথা বলা বন্ধ করুন';
};

recognition.onend = () => {
  isListening = false;
  statusEl.textContent = 'অপেক্ষা করা হচ্ছে...';
  startStopBtn.textContent = '🎙️ কথা বলা শুরু করুন';
};

recognition.onerror = (e) => {
  statusEl.textContent = 'ত্রুটি: ' + e.error;
};

recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  addToHistory(`🧑 আপনি: ${transcript}`);
  statusEl.textContent = 'AI ভাবছে...';

  const aiReply = await getAIResponse(transcript);
  responseText.textContent = aiReply;
  addToHistory(`🤖 AI: ${aiReply}`);
  speak(aiReply);
  statusEl.textContent = 'অপেক্ষা করা হচ্ছে...';
};

function addToHistory(text) {
  const li = document.createElement('li');
  li.textContent = text;
  historyEl.appendChild(li);
  historyEl.scrollTop = historyEl.scrollHeight;
}

clearHistoryBtn.addEventListener('click', () => {
  historyEl.innerHTML = '';
  responseText.textContent = '';
  statusEl.textContent = 'ইতিহাস মুছে দেওয়া হয়েছে।';
});

async function getAIResponse(userInput) {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${huggingFaceApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: userInput
      })
    });

    const result = await response.json();
    console.log(result);

    if (result && result[0] && result[0].generated_text) {
      return result[0].generated_text.trim();
    } else {
      return "উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।";
    }
  } catch (error) {
    console.error(error);
    return "API তে সমস্যা হয়েছে: " + error.message;
  }
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = /[\u0980-\u09FF]/.test(text) ? 'bn-BD' : 'en-US';
  window.speechSynthesis.speak(utterance);
}
