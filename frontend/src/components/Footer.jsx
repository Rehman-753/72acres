import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [placeholder, setPlaceholder] = useState('Your email address')

  const subscribe = () => {
    if (email && email.includes('@')) {
      setEmail('')
      setPlaceholder('Subscribed! Thank you.')
      setTimeout(() => setPlaceholder('Your email address'), 3000)
    }
  }

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-logo"><span className="logo-badge"><b>72</b><i>acres</i></span></div>
            <p className="foot-desc">India's zero-brokerage platform for verified premium real estate buy, rent and sell with total transparency.</p>
            <div className="foot-newsletter">
              <input type="email" placeholder={placeholder} value={email} onChange={(e) => setEmail(e.target.value)} />
              <button onClick={subscribe}>Subscribe</button>
            </div>
            <div className="foot-social">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="Twitter">X</a>
              <a href="#" aria-label="Facebook">FB</a>
            </div>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li><Link to="/properties?listing_type=sale">Buy a Home</Link></li>
              <li><Link to="/properties?listing_type=rent">Rent a Home</Link></li>
              <li><Link to="/properties?property_type=office,shop">Commercial</Link></li>
              <li><Link to="/#cities">New Projects</Link></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><Link to="/#agents">Our Agents</Link></li>
              <li><Link to="/#why">Why 72acres</Link></li>
              <li><Link to="/#faq">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h5>Resources</h5>
            <ul>
              <li><Link to="/#emi">EMI Calculator</Link></li>
              <li><a href="#">Buyer's Guide</a></li>
              <li><a href="#">Legal Checklist</a></li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              <li><a href="mailto:hello@72acres.com">hello@72acres.com</a></li>
              <li><a href="tel:+911800123456">+91 1800-123-456</a></li>
              <li><a href="#">Bandra Kurla Complex, Mumbai</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 72acres. All rights reserved.</span>
          <span>Privacy Policy &nbsp;·&nbsp; Terms of Use &nbsp;·&nbsp; RERA Disclosures</span>
        </div>
      </div>
    </footer>
  )
}
