import { useState, useEffect } from 'react'
import './App.css'

async function fetch_message() {
  const res = await fetch('/api/hello')
  if (!res.ok) throw new Error('Failed to fetch')
  const data = await res.json()
  return data.message
}

function App() {
  const [message, set_message] = useState('Loading...')
  const [error, set_error] = useState(false)

  const load_message = async () => {
    set_error(false)
    set_message('Loading...')
    try {
      const msg = await fetch_message()
      set_message(msg)
    } catch (err) {
      set_message('Failed to fetch message.')
      set_error(true)
      console.error(err)
    }
  }

  useEffect(() => {
    load_message()
  }, [])

  return (
    <div className="app">
      <h1>Product Hackathon</h1>
      <p id="message" className={error ? 'message message--error' : 'message'}>
        {message}
      </p>
      <button type="button" className="btn-refresh" onClick={load_message}>
        Refresh message
      </button>
    </div>
  )
}

export default App
