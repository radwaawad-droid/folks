'use client'

import { useEffect, useRef, useState } from 'react'

/*
  Lightweight square image cropper — no libraries.
  - zoom slider (zoom in / out)
  - drag to reposition (mouse + touch)
  - outputs a clean square JPEG data URL via onDone(dataUrl)
*/
export default function ImageCropper({ file, onDone, onCancel, out = 900 }) {
  const [img, setImg] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [frame, setFrame] = useState(300)
  const drag = useRef(null)

  // size the square frame to the screen once
  useEffect(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 360
    setFrame(Math.min(w - 72, 340))
  }, [])

  // load the chosen file into an Image
  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const im = new Image()
      im.onload = () => { setImg(im); setZoom(1); setPos({ x: 0, y: 0 }) }
      im.src = reader.result
    }
    reader.readAsDataURL(file)
  }, [file])

  function baseScale() {
    if (!img) return 1
    return Math.max(frame / img.naturalWidth, frame / img.naturalHeight)
  }

  function down(e) {
    const p = e.touches ? e.touches[0] : e
    drag.current = { x: p.clientX, y: p.clientY, ox: pos.x, oy: pos.y }
  }
  function move(e) {
    if (!drag.current) return
    const p = e.touches ? e.touches[0] : e
    setPos({ x: drag.current.ox + (p.clientX - drag.current.x), y: drag.current.oy + (p.clientY - drag.current.y) })
  }
  function up() { drag.current = null }

  function confirm() {
    if (!img) return
    const bs = baseScale() * zoom
    const dw = img.naturalWidth * bs
    const dh = img.naturalHeight * bs
    const left = (frame - dw) / 2 + pos.x
    const top = (frame - dh) / 2 + pos.y
    const ratio = out / frame
    const c = document.createElement('canvas')
    c.width = out; c.height = out
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, out, out)
    ctx.drawImage(img, left * ratio, top * ratio, dw * ratio, dh * ratio)
    onDone(c.toDataURL('image/jpeg', 0.85))
  }

  const bs = baseScale() * zoom
  const dw = img ? img.naturalWidth * bs : 0
  const dh = img ? img.naturalHeight * bs : 0
  const imgStyle = img ? {
    position: 'absolute',
    width: dw + 'px', height: dh + 'px',
    left: ((frame - dw) / 2 + pos.x) + 'px',
    top: ((frame - dh) / 2 + pos.y) + 'px',
    userSelect: 'none', pointerEvents: 'none',
  } : {}

  return (
    <div className="cropper-overlay">
      <div className="cropper-card">
        <div className="cropper-title">Adjust your photo</div>
        <div className="cropper-sub">Drag to move · slide to zoom</div>

        <div
          className="cropper-frame"
          style={{ width: frame, height: frame }}
          onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
          onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        >
          {img && <img src={img.src} alt="" style={imgStyle} draggable="false" />}
          <div className="cropper-grid" />
        </div>

        <div className="cropper-zoom">
          <span>−</span>
          <input type="range" min="1" max="3" step="0.01" value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))} />
          <span>+</span>
        </div>

        <div className="cropper-actions">
          <button type="button" className="cropper-btn ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="cropper-btn" onClick={confirm}>Use photo</button>
        </div>
      </div>

      <style jsx>{`
        .cropper-overlay{position:fixed;inset:0;z-index:200;background:rgba(23,40,32,.55);
          display:flex;align-items:center;justify-content:center;padding:18px}
        .cropper-card{background:#FAF6EF;border-radius:22px;padding:22px;max-width:420px;width:100%;
          box-shadow:0 20px 60px rgba(0,0,0,.35)}
        .cropper-title{font-family:'Quicksand',sans-serif;font-weight:700;font-size:19px;color:#1C2620}
        .cropper-sub{color:#6B7770;font-size:13px;margin:4px 0 16px}
        .cropper-frame{position:relative;margin:0 auto;border-radius:16px;overflow:hidden;background:#fff;
          border:1px solid #ECE6DB;touch-action:none;cursor:grab}
        .cropper-frame:active{cursor:grabbing}
        .cropper-grid{position:absolute;inset:0;pointer-events:none;
          background:
            linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35)) center/1px 100% no-repeat,
            linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.35)) center/1px 100% no-repeat;
          box-shadow:inset 0 0 0 1px rgba(32,92,73,.25)}
        .cropper-zoom{display:flex;align-items:center;gap:12px;margin-top:16px;color:#6B7770;font-size:20px;font-weight:700}
        .cropper-zoom input{flex:1;accent-color:#205C49}
        .cropper-actions{display:flex;gap:12px;margin-top:18px}
        .cropper-btn{flex:1;background:#F2774E;color:#fff;border:none;border-radius:14px;padding:14px;
          font-family:'Quicksand',sans-serif;font-weight:700;font-size:15px;cursor:pointer}
        .cropper-btn.ghost{background:#fff;color:#205C49;border:1.5px solid #205C49}
      `}</style>
    </div>
  )
}
