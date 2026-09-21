import { useEffect, useRef, useState } from 'react'
import { useUi } from '../context.jsx'

// Enquiry modal from the reference page (front-end only, as in the original).
export default function ContactModal() {
  const { contactOpen, closeContact } = useUi()
  const [sent, setSent] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = contactOpen ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && closeContact()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [contactOpen, closeContact])

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => {
      closeContact()
      setTimeout(() => {
        setSent(false)
        formRef.current?.reset()
      }, 400)
    }, 2200)
  }

  return (
    <div id="contactModal" className={`contact-modal${contactOpen ? ' active' : ''}`}>
      <div className="contact-overlay" onClick={closeContact}></div>
      <div className="contact-box">
        <button type="button" className="contact-close" id="closeContact" onClick={closeContact}>&times;</button>

        <div id="formStep" style={{ display: sent ? 'none' : 'block' }}>
          <h2>Let's Find Your Home</h2>
          <p>Tell us what you're looking for our advisors will reach out within a few hours.</p>
          <form id="enquiryForm" ref={formRef} onSubmit={submit}>
            <div className="field">
              <label>Name</label>
              <input type="text" name="name" required />
            </div>
            <div className="field">
              <label>Phone no.</label>
              <input type="tel" name="phone" required />
            </div>
            <div className="field field-full">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="field">
              <label>Looking to</label>
              <select name="intent" required defaultValue="">
                <option value="">Select Option</option>
                <option value="Buy">Buy a Property</option>
                <option value="Rent">Rent a Property</option>
                <option value="Sell">Sell / List a Property</option>
                <option value="Invest">Invest</option>
              </select>
            </div>
            <div className="field">
              <label>Budget</label>
              <select name="budget" required defaultValue="">
                <option value="">Select Budget</option>
                <option value="Under 50L">Under ₹50L</option>
                <option value="50L-1Cr">₹50L – ₹1Cr</option>
                <option value="1Cr-2Cr">₹1Cr – ₹2Cr</option>
                <option value="Above 2Cr">Above ₹2Cr</option>
              </select>
            </div>
            <div className="field field-full">
              <label>Message</label>
              <textarea name="message" placeholder="Tell us your preferred location, property type, or any specific requirement…"></textarea>
            </div>
            <div className="field field-submit">
              <button type="submit">Submit Enquiry</button>
            </div>
          </form>
        </div>

        <div className={`form-success${sent ? ' show' : ''}`} id="formSuccess">
          <div className="tick">✓</div>
          <h2 style={{ textAlign: 'center' }}>Thank you!</h2>
          <p style={{ textAlign: 'center' }}>Your enquiry has been received. An 72acres advisor will reach out to you shortly.</p>
        </div>
      </div>
    </div>
  )
}
