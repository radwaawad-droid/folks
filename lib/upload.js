// Uploads a cropped JPEG blob to Supabase Storage and returns its public URL.
// Falls back to a base64 data URL if storage isn't set up yet, so listing never
// breaks even before ADD_STORAGE.sql has been run.
const BUCKET = 'item-photos'

export async function uploadPhoto(supabase, blob) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const prefix = user?.id || 'anon'
    const name = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
    const { error } = await supabase.storage.from(BUCKET)
      .upload(name, blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(name)
    if (data?.publicUrl) return data.publicUrl
    throw new Error('no public url')
  } catch (_) {
    // Storage not ready — fall back to an inline data URL so uploads still work.
    return await blobToDataUrl(blob)
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => resolve(null)
    r.readAsDataURL(blob)
  })
}
