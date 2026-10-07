import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

// "2026-10-10T00:00:00.000Z" -> "2026-10-10" (date inputs only accept YYYY-MM-DD)
function toDateInput(value) {
  return value ? String(value).slice(0, 10) : ''
}

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // TODO 3: edit mode - load the booking and fill the form
  useEffect(() => {
    if (!id) return
    api
      .get(`/bookings/${id}`)
      .then((res) => {
        // works whether the server sends the booking directly or wrapped
        const b = res.data?.booking || res.data?.data || res.data
        setForm({
          roomNumber: b.roomNumber || '',
          startDate: toDateInput(b.startDate),
          endDate: toDateInput(b.endDate),
          purpose: b.purpose || '',
        })
      })
      .catch((err) => {
        console.log(err)
        setError(
          err.response?.data?.message || err.message || 'Could not load booking'
        )
      })
  }, [id])

  // TODO 1: update the matching field when any input changes
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // TODO 2: POST a new booking, or PATCH when editing
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose,
    }
    try {
      if (id) {
        await api.patch(`/bookings/${id}`, payload)
      } else {
        await api.post('/bookings', payload)
      }
      nav('/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="roomNumber"
          type="text"
          placeholder="Room number (e.g. B2-104)"
          value={form.roomNumber}
          onChange={onChange}
          required
        />
        <input
          className="input"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={onChange}
          required
        />
        <input
          className="input"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={onChange}
          required
        />
        <textarea
          className="input"
          name="purpose"
          placeholder="Purpose (optional)"
          value={form.purpose}
          onChange={onChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}