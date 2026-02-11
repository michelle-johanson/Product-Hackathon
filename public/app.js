async function fetchMessage() {
  try {
    const res = await fetch('/api/hello');
    const data = await res.json();
    document.getElementById('message').textContent = data.message;
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to fetch message.';
    console.error(err);
  }
}

document.getElementById('refresh').addEventListener('click', fetchMessage);

// Initial fetch
fetchMessage();
