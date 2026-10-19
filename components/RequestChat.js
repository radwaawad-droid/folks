'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { notify } from '@/lib/notify'

// Private 1:1 board attached to a reply (the "I have this" offer).
// Both the requester and the neighbour who offered can talk here to agree
// on specs, cost and pickup.
export default function RequestChat({ replyId, meId, initial, disabled = false }) {
  const supabase = createClient()
  const [messages, setMessages] = useState(initial || [])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    async function markRead() {
      await supabase.from('request_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('reply_id', replyId)
        .neq('sender_id', meId)
        .is('read_at', null)
    }
    markRead()

    const channel = supabase
      .channel(`request_messages-${replyId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'request_messages', filter: `reply_id=eq.${replyId}` },
        (payload) => {
          setMessages((cur) => cur.some((m) => m.id === payload.new.id) ? cur : [...cur, payload.new])
        })
      .subscribe()

    // Fallback poll in case Realtime isn't enabled on the table.
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('request_messages').select('*').eq('reply_id', replyId).order('created_at', { ascending: true })
      if (data) setMessages(data)
    }, 5000)

    return () => { supabase.removeChannel(channel); clearInterval(poll) }
  }, [replyId])

  async function send(e) {
    e.preventDefault()
    const text = body.trim()
    if (!text || disabled) return
    setSending(true); setBody('')
    const { data, error } = await supabase
      .from('request_messages')
      .insert({ reply_id: replyId, sender_id: meId, body: text })
      .select().single()
    setSending(false)
    if (!error && data) {
      setMessages((cur) => cur.some((m) => m.id === data.id) ? cur : [...cur, data])
      notify({ type: 'wanted_message', replyId })
    }
  }

  return (
    <div className="chat chat-inline">
      <div className="chat-body">
        {messages.length === 0 && (
          <div className="chat-empty">Agree on specs, cost and a pickup time.</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`bub ${m.sender_id === meId ? 'me' : 'them'}`}>{m.body}</div>
        ))}
        <div ref={endRef} />
      </div>
      {!disabled && (
        <form className="composer" onSubmit={send}>
          <input className="composer-in" placeholder="Type a message…"
            value={body} onChange={(e) => setBody(e.target.value)} />
          <button className="send" disabled={sending} aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      )}

      <style jsx>{`
        .chat-inline{margin-top:10px}
      `}</style>
    </div>
  )
}
