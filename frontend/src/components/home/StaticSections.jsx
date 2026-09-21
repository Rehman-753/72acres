import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUi } from '../../context.jsx'

const Svg = ({ children, size = 18, sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>{children}</svg>
)

/* ---------------- TRUST STRIP ---------------- */
export function TrustStrip() {
  const items = [
    ['0% Brokerage', 'On every transaction', <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></>],
    ['RERA Verified', 'Every listing checked', <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />],
    ['Legal Assistance', 'End-to-end support', <><path d="M22 11.08V12a10 10 0 1 1-5.9-9.1" /><path d="M22 4L12 14.01l-3-3" /></>],
    ['24×7 Support', 'Always reachable', <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>],
    ['40,000+ Families', 'Trust 72acres', <path d="M20 6L9 17l-5-5" />],
  ]
  return (
    <section className="trust-strip">
      <div className="wrap">
        {items.map(([b, s, icon]) => (
          <div className="trust-item" key={b}>
            <div className="ico"><Svg>{icon}</Svg></div>
            <div><b>{b}</b><span>{s}</span></div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------- STATS BAND ---------------- */
function Counter({ target, suffix }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    const el = ref.current
    let raf = 0
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        let start = null
        const step = (ts) => {
          if (!start) start = ts
          const progress = Math.min((ts - start) / 1800, 1)
          setN(Math.floor((1 - Math.pow(1 - progress, 3)) * target))
          if (progress < 1) raf = requestAnimationFrame(step)
          else setN(target)
        }
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target])

  return (
    <div className="counter" ref={ref}>
      <span>{n.toLocaleString('en-IN')}</span>
      <span className="suffix">{suffix}</span>
    </div>
  )
}

export function StatsBand() {
  const stats = [
    [42000, '+', 'Verified property listings across India'],
    [25, '', 'Cities with active on-ground presence'],
    [40, 'K+', 'Families who found their home with us'],
    [12, 'Yrs', 'Of trusted real estate expertise'],
  ]
  return (
    <section className="stats-band" style={{ padding: 0 }}>
      <div className="stats-grid">
        {stats.map(([t, s, label]) => (
          <div className="stat-cell reveal" key={label}>
            <Counter target={t} suffix={s} />
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------- WHY CHOOSE US ---------------- */
export function WhySection() {
  const cards = [
    ['Zero Brokerage, Always', 'Deal directly with verified owners and builders. No hidden commissions, no surprise fees at closing.', <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></>],
    ['100% Verified Listings', 'Every property is physically inspected and legally vetted before it goes live on our platform.', <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />],
    ['Transparent Pricing', "Live market comparisons and historic price trends so you always know you're paying it right.", <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />],
    ['Home Loan Assistance', 'Pre-approved offers from 15+ leading banks and NBFCs, with rates negotiated on your behalf.', <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a4 4 0 0 1 8 0v2" /></>],
    ['End-to-End Legal Support', 'Title checks, agreement drafting and registration handled by our in-house legal team.', <><path d="M22 11.08V12a10 10 0 1 1-5.9-9.1" /><path d="M22 4L12 14.01l-3-3" /></>],
    ['Immersive Virtual Tours', 'Walk through every property in 3D from anywhere before scheduling an in-person visit.', <><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></>],
  ]
  return (
    <section id="why">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow">The 72acres Difference</div>
            <h2>Why families choose<br />72acres</h2>
          </div>
          <p>Real estate should feel exciting, not exhausting. Here's what sits behind every home we help you find.</p>
        </div>
        <div className="why-grid reveal">
          {cards.map(([h, p, icon]) => (
            <div className="why-card" key={h}>
              <div className="why-ico"><Svg size={22} sw={1.8}>{icon}</Svg></div>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- PROCESS ---------------- */
export function ProcessSection() {
  const steps = [
    ['Tell Us What You Need', 'Share your budget, location and must-haves we shortlist accordingly.'],
    ['Curated Shortlist', 'Receive a handpicked list of verified properties matching your criteria.'],
    ['Tour & Negotiate', 'Visit in person or virtually, then negotiate directly with zero broker markup.'],
    ['Close With Confidence', 'Legal, loan and registration support until the keys are truly yours.'],
  ]
  return (
    <section id="process" className="dark">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow">How It Works</div>
            <h2>From search to<br />keys in hand</h2>
          </div>
          <p>A guided, transparent journey so you always know exactly where your purchase stands.</p>
        </div>
        <div className="process-track reveal">
          {steps.map(([h, p], i) => (
            <div className="process-step" key={h}>
              <div className="process-dot">{String(i + 1).padStart(2, '0')}</div>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- EXPLORE BY CITY (click -> filtered listing) ---------------- */
export function CitiesSection() {
  const navigate = useNavigate()
  const cities = [
    ['Mumbai', 'Mumbai', '6,400+ Listings', 'photo-1570168007204-dfb528c6958f'],
    ['Delhi NCR', 'Delhi', '8,100+ Listings', 'photo-1587474260584-136574528ed5'],
    ['Bangalore', 'Bangalore', '5,900+ Listings', 'photo-1596176530529-78163a4f7af2'],
    ['Pune', 'Pune', '3,200+ Listings', 'photo-1595658658481-d53d3f999875'],
  ]
  return (
    <section id="cities" className="ivory">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow">Pan-India Presence</div>
            <h2>Explore by <em>City</em></h2>
          </div>
          <p>From metro skylines to emerging suburbs — find verified listings in every market that matters.</p>
        </div>
        <div className="city-grid reveal">
          {cities.map(([name, query, count, img]) => (
            <div className="city-card" key={name} onClick={() => navigate(`/properties?city=${query}`)}>
              <img src={`https://images.unsplash.com/${img}?w=500&h=500&fit=crop`} alt={name} />
              <div className="city-info"><b>{name}</b><span>{count}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- EMI CALCULATOR ---------------- */
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')

export function EmiSection() {
  const [P, setP] = useState(7500000)
  const [rate, setRate] = useState(8.5)
  const [years, setYears] = useState(20)
  const r = rate / 12 / 100
  const n = years * 12
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const total = emi * n

  return (
    <section id="emi">
      <div className="wrap">
        <div className="emi-wrap">
          <div className="reveal-left">
            <div className="eyebrow">Plan Your Purchase</div>
            <h2 className="emi-title">Home Loan <em>EMI Calculator</em></h2>
            <p style={{ fontSize: 17, maxWidth: 440 }}>Estimate your monthly instalment in seconds and see exactly how much of your payment goes toward principal versus interest.</p>
            <div style={{ display: 'flex', gap: 14, marginTop: 34, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="why-ico" style={{ margin: 0, width: 40, height: 40 }}><Svg size={16}><path d="M20 6L9 17l-5-5" /></Svg></div>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>Pre-approved offers from 15+ lenders</span>
              </div>
            </div>
          </div>

          <div className="emi-card reveal-right">
            <div className="emi-row">
              <div className="emi-row-head"><label>Loan Amount</label><b>{inr(P)}</b></div>
              <input type="range" min="500000" max="50000000" step="100000" value={P} onChange={(e) => setP(+e.target.value)} />
            </div>
            <div className="emi-row">
              <div className="emi-row-head"><label>Interest Rate</label><b>{rate.toFixed(1)}%</b></div>
              <input type="range" min="6" max="14" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} />
            </div>
            <div className="emi-row">
              <div className="emi-row-head"><label>Loan Tenure</label><b>{years} Years</b></div>
              <input type="range" min="1" max="30" step="1" value={years} onChange={(e) => setYears(+e.target.value)} />
            </div>
            <div className="emi-result">
              <span>Monthly EMI</span>
              <b>{inr(emi)}</b>
              <div className="emi-breakdown">
                <div><span>Principal</span><b>{inr(P)}</b></div>
                <div><span>Total Interest</span><b>{inr(total - P)}</b></div>
                <div><span>Total Payment</span><b>{inr(total)}</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- AGENTS ---------------- */
export function AgentsSection() {
  const agents = [
    ['Ananya Rao', 'Senior Advisor, Mumbai', 'women/65'],
    ['Rohan Mehta', 'Luxury Homes, Delhi NCR', 'men/32'],
    ['Priya Nair', 'Commercial Lead, Bangalore', 'women/44'],
    ['Karan Shah', 'Investment Advisor, Pune', 'men/54'],
  ]
  return (
    <section id="agents" className="ivory">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow">Meet The Team</div>
            <h2>Advisors who know<br />the market cold</h2>
          </div>
          <p>Local experts with deep neighbourhood knowledge, available whenever you need them.</p>
        </div>
        <div className="agents-grid reveal">
          {agents.map(([name, role, pic]) => (
            <div className="agent-card" key={name}>
              <div className="agent-photo">
                <img src={`https://randomuser.me/api/portraits/${pic}.jpg`} alt={name} />
                <div className="agent-social"><a href="#">in</a><a href="#">✆</a><a href="#">✉</a></div>
              </div>
              <h4>{name}</h4><span>{role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- TESTIMONIALS ---------------- */
export function TestimonialsSection() {
  const slides = [
    ['"We saved nearly ₹4 lakh in brokerage alone. The team was transparent from day one and the legal support made registration completely stress-free."', 'Meera Iyer', 'Bought a 3BHK in Bandra West', 'women/68'],
    ['"The virtual tour let us shortlist five properties before ever landing in the city. By the time we visited, we already knew which one was home."', 'Arjun Verma', 'Bought a Villa in Whitefield', 'men/76'],
    ['"Our advisor negotiated a better home loan rate than our own bank offered. 72acres genuinely works for the buyer, not the deal."', 'Sneha Kapoor', 'Bought an Apartment in Baner', 'women/23'],
  ]
  const [cur, setCur] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCur((c) => (c + 1) % slides.length), 5500)
    return () => clearInterval(t)
  }, [slides.length])

  return (
    <section className="dark">
      <div className="wrap">
        <div className="section-head reveal" style={{ justifyContent: 'center', textAlign: 'center', gridTemplateColumns: '1fr' }}>
          <div><div className="eyebrow" style={{ justifyContent: 'center' }}>What Families Say</div><h2>Stories from our<br />homeowners</h2></div>
        </div>
        <div className="testi-wrap reveal">
          {slides.map(([quote, who, what, pic], i) => (
            <div className={`testi-slide${i === cur ? ' active' : ''}`} key={who}>
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">{quote}</p>
              <div className="testi-who">
                <img src={`https://randomuser.me/api/portraits/${pic}.jpg`} alt={who} />
                <b>{who}</b><span>{what}</span>
              </div>
            </div>
          ))}
          <div className="testi-dots" id="testiDots">
            {slides.map((_, i) => (
              <div key={i} className={`testi-dot${i === cur ? ' active' : ''}`} onClick={() => setCur(i)}></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */
function FaqItem({ q, a, open, onToggle }) {
  const ref = useRef(null)
  const [h, setH] = useState(0)
  useEffect(() => {
    setH(open ? ref.current.scrollHeight : 0)
  }, [open])
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <div className="faq-q" onClick={onToggle}><h4>{q}</h4><div className="faq-icon"></div></div>
      <div className="faq-a" ref={ref} style={{ maxHeight: h }}><p>{a}</p></div>
    </div>
  )
}

export function FaqSection() {
  const [open, setOpen] = useState(0)
  const faqs = [
    ['Is 72acres really zero brokerage?', "Yes always. We connect you directly with verified owners and builders, so you never pay a brokerage fee on any transaction, whether you're buying, selling or renting."],
    ['How are listings verified?', "Every property undergoes a physical site inspection along with a legal title and RERA registration check before it's published on our platform."],
    ['Do you help with home loans?', 'Yes. We work with 15+ banks and NBFCs to get you pre-approved offers and negotiate preferential interest rates on your behalf, at no extra cost.'],
    ['Which cities do you operate in?', 'We currently have active, on-ground teams in 25 cities including Mumbai, Delhi NCR, Bangalore, Pune, Hyderabad and Chennai, with new markets launching every quarter.'],
    ['Can I list my own property for sale or rent?', 'Absolutely. Click "List Your Property" in the navigation and log in to your lister account. Once the admin has approved your account you can add and manage your properties.'],
  ]
  return (
    <section id="faq">
      <div className="wrap">
        <div className="section-head reveal" style={{ gridTemplateColumns: '1fr', textAlign: 'center', justifyItems: 'center' }}>
          <div><div className="eyebrow" style={{ justifyContent: 'center' }}>Questions, Answered</div><h2>Frequently asked<br />questions</h2></div>
        </div>
        <div className="faq-list reveal">
          {faqs.map(([q, a], i) => (
            <FaqItem key={q} q={q} a={a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- CTA BANNER ---------------- */
export function CtaBanner() {
  const { openContact } = useUi()
  return (
    <section className="cta-banner">
      <div className="wrap reveal">
        <div className="eyebrow" style={{ justifyContent: 'center' }}>Start Your Search</div>
        <h2>Your next address is<br />closer than you think.</h2>
        <p>Talk to an advisor today and get a curated shortlist within 24 hours, completely free of brokerage.</p>
        <a href="#" className="btn-primary open-contact" onClick={(e) => { e.preventDefault(); openContact() }}>Get a Free Consultation &nbsp;→</a>
      </div>
    </section>
  )
}
