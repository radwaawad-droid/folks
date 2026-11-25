// Resize/compress an image File to a JPEG blob, keeping chat photos small and
// consistent before upload. Returns null if the file can't be read.
export async function fileToJpegBlob(file, max = 1280, quality = 0.82) {
  try {
    const dataUrl = await new Promise((res, rej) => {
      const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file)
    })
    const img = await new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl
    })
    let w = img.naturalWidth, h = img.naturalHeight
    if (w > max || h > max) { const s = Math.min(max / w, max / h); w = Math.round(w * s); h = Math.round(h * s) }
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return await new Promise((res) => c.toBlob((b) => res(b), 'image/jpeg', quality))
  } catch (_) {
    return null
  }
}
