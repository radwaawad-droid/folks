'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { notify } from '@/lib/notify'
import { avatarColor } from '@/lib/avatar'
import { uploadPhoto } from '@/lib/upload'
import { fileToJpegBlob } from '@/lib/image'

function fmtTime(ts) {
  try { return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }
  catch { return '' }
}
function sameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}
function dayLabel(ts) {
  const d = new Date(ts), today = new Date(), yest = new Date()
  yest.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yest.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function ChatThread({ bookingId, meId, initial, otherName, otherSub }) {
  const supabase = createClient()
  const [messages, setMessages] = useState(initial || [])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
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

  async function sendImage(file) {
    if (!file || uploading) return
    setUploading(true)
    const blob = await fileToJpegBlob(file)
    if (!blob) { setUploading(false); return }
    const url = await uploadPhoto(supabase, blob)
    if (url) {
      const { data, error } = await supabase
        .from('messages')
        .insert({ booking_id: bookingId, sender_id: meId, image_url: url })
        .select().single()
      if (!error && data) {
        setMessages((cur) => cur.some((m) => m.id === data.id) ? cur : [...cur, data])
        notify({ type: 'message', bookingId })
      }
    }
    setUploading(false)
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
          const prev = messages[i - 1]
          const showDate = !prev || !sameDay(prev.created_at, m.created_at)
          return (
            <Fragment key={m.id}>
              {showDate && <div className="chat-date">{dayLabel(m.created_at)}</div>}
              <div className={`msg ${mine ? 'me' : 'them'}`}>
                <div className={`bub ${mine ? 'me' : 'them'}${m.image_url ? ' has-img' : ''}`}>
                  {m.image_url && (
                    <a href={m.image_url} target="_blank" rel="noreferrer">
                      <img className="bub-img" src={m.image_url} alt="" loading="lazy" />
                    </a>
                  )}
                  {m.body && <div className={m.image_url ? 'bub-cap' : ''}>{m.body}</div>}
                </div>
                <div className="time">
                  {fmtTime(m.created_at)}
                  {lastMine && m.read_at && <> · <span className="rr">Read</span></>}
                </div>
              </div>
            </Fragment>
          )
        })}
        <div ref={endRef} />
      </div>
      <form className="composer" onSubmit={send}>
        <label className="composer-attach" aria-label="Add photo" title="Add photo">
          {uploading
            ? <span className="composer-spin" />
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>}
          <input type="file" accept="image/*" hidden disabled={uploading}
            onChange={(e) => { sendImage(e.target.files?.[0]); e.target.value = '' }} />
        </label>
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
