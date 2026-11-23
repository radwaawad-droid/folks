'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { notify } from '@/lib/notify'
import { avatarColor } from '@/lib/avatar'

function fmtTime(ts) {
  try { return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }
  catch { return '' }
}

export default function ChatThread({ bookingId, meId, initial, otherName, otherSub }) {
  const supabase = createClient()
  const [messages, setMessages] = useState(initial || [])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  function scrollToEnd() {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(scrollToEnd, [messages])

  useEffect(() => {
    // Mark the other person's messages as read when I open the thread.
    async function markRead() {
      await supabase.from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('booking_id', bookingId)
        .neq('sender_id', meId)
        .is('read_at', null)
    }
    markRead()

    // Live updates via Supabase Realtime.
    const channel = supabase
      .channel(`messages-${bookingId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          setMessages((cur) => cur.some((m) => m.id === payload.new.id) ? cur : [...cur, payload.new])
        })
      .subscribe()

    // Safety-net poll in case Realtime isn't enabled on the table.
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true })
      if (data) setMessages(data)
    }, 5000)

    return () => { supabase.removeChannel(channel); clearInterval(poll) }
  }, [bookingId])

  async function send(e) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setSending(true)
    setBody('')
    const { data, error } = await supabase
      .from('messages')
      .insert({ booking_id: bookingId, sender_id: meId, body: text })
      .select().single()
    setSending(false)
    if (!error && data) {
      setMessages((cur) => cur.some((m) => m.id === data.id) ? cur : [...cur, data])
      // Email the other person (best-effort; server collapses bursts into one email).
      notify({ type: 'message', bookingId })
    }
  }

  return (
    <div className="chat">
      {otherName && (
        <div className="chat-head">
          <div className="avatar" style={{ width: 38, height: 38, background: avatarColor(otherName) }}>{otherName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="chat-head-name">{otherName}</div>
            {otherSub && <div className="chat-head-sub">{otherSub}</div>}
          </div>
        </div>
      )}
      <div className="chat-body">
        {messages.length === 0 && (
          <div className="chat-empty">Say hello and arrange a pickup.</div>
        )}
        {messages.map((m, i) => {
          const mine = m.sender_id === meId
          const lastMine = mine && i === messages.map((x) => x.sender_id === meId).lastIndexOf(true)
          return (
            <div key={m.id} className={`msg ${mine ? 'me' : 'them'}`}>
              <div className={`bub ${mine ? 'me' : 'them'}`}>{m.body}</div>
              <div className="time">
                {fmtTime(m.created_at)}
                {lastMine && m.read_at && <> · <span className="rr">Read</span></>}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>
      <form className="composer" onSubmit={send}>
        <input className="composer-in" placeholder="Type a message…"
          value={body} onChange={(e) => setBody(e.target.value)} />
        <button className="send" disabled={sending} aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
