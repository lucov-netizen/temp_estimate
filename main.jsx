import { useState, useEffect } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#090909", card: "#131313", card2: "#1A1A1A", border: "#242424",
  borderLight: "#2E2E2E", gold: "#C8922A", goldLight: "#E8B84B",
  goldFaint: "#C8922A18", goldBorder: "#C8922A45", white: "#F0F0F0",
  muted: "#7A7A7A", muted2: "#3E3E3E", green: "#3BA877", greenLight: "#5DD99A",
  greenFaint: "#0D2018", greenBorder: "#1D4A35",
  blue: "#4A8FD9", purple: "#9B7FD9", purpleFaint: "#0F0818",
  selectedBg: "#130D00", orange: "#D4721A",
};

// ─── CONFIG — edit these ──────────────────────────────────────────────────────
const STORAGE_KEY    = "308-ef-rusv-v6";
const ESTIMATE_NUM   = "EST-0522-RUSV";
const TODAY          = "May 22, 2026";
const VALID_UNTIL    = "June 5, 2026";
const PROPERTY       = "308 E F St — Russellville, AR 72802";
const CONTRACTOR_TEL = "(501) 269-7199";
const OWNER_EMAIL    = "lucov.gutierrez@gmail.com";

// Sends the client's selection to your email.
const SUBMIT_URL     = `https://formsubmit.co/ajax/${OWNER_EMAIL}`;
// ─────────────────────────────────────────────────────────────────────────────

const PREP = [
  { id: "basic",    label: "Basic",    price: 380,  tag: "ENTRY LEVEL",   color: C.blue,
    items: ["Full power wash","Scraping of loose paint","General surface cleaning"],
    note: "Recommended only for surfaces in good condition. This siding requires more." },
  { id: "standard", label: "Standard", price: 800,  tag: "RECOMMENDED",   color: C.gold, recommended: true,
    items: ["Everything in Basic +","Sanding of cracked areas","Caulking gaps & joints","Spot prime on exposed wood"],
    note: "Best match for current property conditions — cracked paint and exposed wood throughout." },
  { id: "premium",  label: "Premium",  price: 1250, tag: "BEST RESULT",   color: C.purple,
    items: ["Everything in Standard +","Full 100% primer coat","Wood filler on damaged areas","Estimated durability: 8–12 years"],
    note: "Maximum investment — maximum durability and property value." },
];

const FIXED = [
  { id:"f1", icon:"🏠", label:"Exterior Siding — Painting",  price:1950, desc:"1,501 sq ft net · wood siding · 2 coats premium exterior paint · labor only" },
  { id:"f2", icon:"☁️", label:"Soffit & Fascia",             price:720,  desc:"122 lf fascia + 144 sq ft soffit · full perimeter · labor only" },
  { id:"f3", icon:"🔲", label:"Trim & Moldings",             price:780,  desc:"312 lf total · 15 windows + 2 doors + corner trim · labor only" },
];

const OPTIONAL = [
  { id:"foundation",      icon:"🪨", label:"Exterior Foundation",              price:360,  badge:"Highly Recommended", defaultOn:true, desc:"325 sq ft · 130 lf × 2.5 ft avg · stone/concrete · labor only" },
  { id:"pillars",         icon:"🏛️", label:"Entry Pillars (3×3×5 ft)",         price:195,  desc:"Prep, prime and finish on entry pillars · labor only" },
  { id:"deck_stain",      icon:"🪵", label:"Deck Stain — 18×6 ft",             price:240,  desc:"108 sq ft · cleaning + stain application · labor only" },
  { id:"handrails_basic", icon:"🔩", label:"Handrails — 52 lf (No Balusters)", price:80,   desc:"Painting of existing handrails · labor only", exclusive:"handrails" },
  { id:"handrails_full",  icon:"⚙️", label:"Handrails — 52 lf (With Balusters)", price:300, desc:"Full painting including balusters · labor only", exclusive:"handrails" },
  { id:"front_steps",     icon:"🪜", label:"Front Entry Steps",                price:95,   desc:"Prep and painting of front entry steps · labor only" },
];

const UPGRADES = [
  { id:"rear_deck",        icon:"🔧", label:"Rear Deck Reconstruction",           price:500, badge:"Includes Materials",  includesMaterials:true, desc:"Full reconstruction of rear deck · this item INCLUDES materials" },
  { id:"foundation_doors", icon:"🚪", label:"New Foundation Access Doors (×2)",   price:520, badge:"Labor Only",          desc:"2 new 3×3 wood doors · replacement of deteriorated crawl space access · labor only" },
];

const ROI = [
  { icon:"📈", title:"Estimated Value Increase",    value:"+$8K–$15K", note:"A properly painted wood siding exterior can improve perceived value, curb appeal and buyer confidence." },
  { icon:"🛡️", title:"Moisture & Rot Protection",  value:"5–10 Years", note:"Unpainted or exposed wood absorbs moisture. Proper prep and finish help prevent premature wood damage." },
  { icon:"🏡", title:"Curb Appeal",                value:"High Impact", note:"Exterior painting is one of the first visible improvements buyers, tenants and appraisers notice." },
  { icon:"⚡", title:"Prevention of Future Costs", value:"Protective Work", note:"Addressing foundation, pillars and crawl space access now helps prevent bigger repair costs later." },
];

const fmt = (n) => "$" + n.toLocaleString("en-US");

function lsGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; }
}

function LineItem({ label, price, color }) {
  return (
    <div style={{ padding:"9px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:5, height:5, borderRadius:"50%", background:color||C.muted, flexShrink:0 }} />
        <span style={{ fontSize:12, color:"#C0C0C0" }}>{label}</span>
      </div>
      <span style={{ fontSize:13, fontWeight:600, color:C.white, whiteSpace:"nowrap" }}>{fmt(price)}</span>
    </div>
  );
}

function ConfirmationScreen({ total, selections, saveTime, onUpdate, bf, df, decision, sentOk, sendError }) {
  const p40  = Math.round(total * 0.40);
  const p30a = Math.round(total * 0.30);
  const p30b = total - p40 - p30a;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:bf, display:"flex", flexDirection:"column" }}>
      <div style={{ background:"linear-gradient(160deg,#062014 0%,#0A1A10 50%,#090909 100%)", padding:"40px 20px 32px", textAlign:"center", borderBottom:`1px solid ${C.greenBorder}` }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${C.green},#2A9060)`, margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 40px ${C.green}40` }}>
          <span style={{ fontSize:32, color:"#fff" }}>✓</span>
        </div>
        <div style={{ fontSize:10, color:C.green, letterSpacing:"3px", fontWeight:700, marginBottom:10 }}>
          {decision === "accepted" ? "ESTIMATE ACCEPTED" : "SELECTION RECEIVED"}
        </div>
        <div style={{ fontFamily:df, fontSize:26, fontWeight:700, color:C.white, lineHeight:1.2, marginBottom:8 }}>
          {decision === "accepted" ? "You're All Set!" : "Thanks — We'll Review It"}
        </div>
        <div style={{ fontSize:13, color:C.muted, lineHeight:1.8, maxWidth:360, margin:"0 auto" }}>
          {decision === "accepted"
            ? "Your selection was submitted. Our team will review everything and prepare the invoice."
            : "Your selection was submitted as not approved yet. Our team will review your options before sending an invoice."}
        </div>
        <div style={{ marginTop:18, display:"inline-flex", alignItems:"center", gap:12, background:`${C.green}18`, border:`1px solid ${C.greenBorder}`, borderRadius:40, padding:"10px 22px" }}>
          <span style={{ fontSize:12, color:C.muted }}>Confirmed labor total</span>
          <span style={{ fontFamily:df, fontSize:22, color:C.greenLight, fontWeight:700 }}>{fmt(total)}</span>
        </div>
        <div style={{ fontSize:10, color:C.muted2, marginTop:8 }}>Submitted {saveTime}</div>

        <div style={{
          margin:"14px auto 0",
          maxWidth:360,
          background: sentOk ? `${C.green}18` : "#1A0800",
          border:`1px solid ${sentOk ? C.greenBorder : C.orange}`,
          borderRadius:10,
          padding:"10px 12px",
          fontSize:11,
          color: sentOk ? C.greenLight : C.orange,
          lineHeight:1.5
        }}>
          {sentOk
            ? "✓ Your selections were sent to Omega Home Solutions."
            : `⚠️ The confirmation screen is saved, but email delivery may need review. ${sendError || "Please screenshot and send it manually."}`}
        </div>
      </div>

      <div style={{ maxWidth:580, margin:"0 auto", width:"100%", padding:"0 20px 80px", boxSizing:"border-box" }}>
        <div style={{ marginTop:20, background:"#0A1500", border:`1.5px solid ${C.green}`, borderRadius:12, padding:16, textAlign:"center" }}>
          <div style={{ fontSize:22, marginBottom:8 }}>📸</div>
          <div style={{ fontSize:13, fontWeight:700, color:C.white, marginBottom:6 }}>Save Your Confirmation</div>
          <div style={{ fontSize:12, color:C.muted, lineHeight:1.7 }}>
            Backup step: take a screenshot of this screen and send it to us at<br/>
            <span style={{ color:C.greenLight, fontWeight:700, fontSize:14 }}>{CONTRACTOR_TEL}</span><br/>
            via text or WhatsApp so we can confirm your selection.
          </div>
        </div>

        <div style={{ paddingTop:24 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.white, marginBottom:16 }}>What Happens Next</div>
          {[
            { icon:"📋", title:"We review your selections", desc:"Our team goes over every option you selected and confirms all details for 308 E F St." },
            { icon:"📐", title:"Preparations are arranged", desc:"We schedule the crew, materials and equipment based on your chosen services and prep level." },
            { icon:"📧", title:"You receive an invoice", desc:"An itemized invoice will be sent to you so you can review, approve and confirm your start date." },
            { icon:"🗓️", title:"Work begins", desc:"Once the invoice is confirmed and the initial payment is received, we get started as soon as possible." },
          ].map((s, i) => (
            <div key={i} style={{ display:"flex", gap:14, marginBottom:18 }}>
              <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:C.greenFaint, border:`1px solid ${C.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:16 }}>{s.icon}</span>
                </div>
                {i < 3 && <div style={{ width:1, height:20, background:C.greenBorder, marginTop:4 }} />}
              </div>
              <div style={{ paddingTop:4 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.white, marginBottom:3 }}>{s.title}</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", marginBottom:16 }}>
          <div style={{ padding:"12px 16px", background:C.goldFaint, borderBottom:`1px solid ${C.goldBorder}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.goldLight }}>Your Payment Schedule — 40 / 30 / 30</div>
          </div>
          {[
            { icon:"📅", label:"To reserve your start date", amount:p40, pct:"40%" },
            { icon:"🔨", label:"Upon completion of prep work", amount:p30a, pct:"30%" },
            { icon:"🎨", label:"Upon completion of painting", amount:p30b, pct:"30%" },
          ].map((p, i) => (
            <div key={i} style={{ padding:"11px 16px", borderBottom:i<2?`1px solid ${C.border}`:"none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:15 }}>{p.icon}</span>
                <span style={{ fontSize:12, color:"#CCC" }}>{p.label}</span>
              </div>
              <div style={{ textAlign:"right", whiteSpace:"nowrap" }}>
                <span style={{ fontSize:14, fontWeight:700, color:C.goldLight }}>{fmt(p.amount)}</span>
                <span style={{ fontSize:10, color:C.muted, marginLeft:6 }}>{p.pct}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.white, marginBottom:12 }}>💳 We Accept</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[["💵","Cash"],["📝","Personal / Business Check"],["💳","Credit Card"],["🏦","Debit Card"]].map(([ic,lb],i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:C.card2, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 12px" }}>
                <span style={{ fontSize:16 }}>{ic}</span>
                <span style={{ fontSize:12, color:C.muted }}>{lb}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", marginBottom:16 }}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.white }}>Your Selected Services</div>
          </div>
          <div style={{ padding:"12px 16px" }}>
            {selections.map((s,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:6, gap:12 }}>
                <span style={{ fontSize:12, color:C.muted }}>· {s.label}</span>
                <span style={{ fontSize:12, fontWeight:600, color:C.white, whiteSpace:"nowrap" }}>{fmt(s.price)}</span>
              </div>
            ))}
            <div style={{ borderTop:`1px solid ${C.border}`, marginTop:8, paddingTop:8, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.white }}>Total Labor</span>
              <span style={{ fontSize:14, fontWeight:700, color:C.goldLight }}>{fmt(total)}</span>
            </div>
            <div style={{ fontSize:10, color:C.orange, marginTop:4 }}>⚠️ Paint materials & miscellaneous billed separately</div>
          </div>
        </div>

        <div style={{ background:C.greenFaint, border:`1px solid ${C.greenBorder}`, borderRadius:12, padding:16, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.green, marginBottom:8 }}>📌 Good to Know</div>
          {[
            "Estimate valid for 14 days from issue date (May 22, 2026).",
            "Any rotten or damaged wood found during prep will be quoted separately before proceeding — no surprises.",
            "All labor comes with a 1-year workmanship warranty.",
            "You'll receive a full itemized invoice before any work begins.",
          ].map((t,i) => (
            <div key={i} style={{ fontSize:11, color:C.muted, marginBottom:4, lineHeight:1.6, display:"flex", gap:6 }}>
              <span style={{ color:C.green, flexShrink:0 }}>·</span>{t}
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", padding:"8px 0 16px" }}>
          <div style={{ fontSize:13, color:C.muted, lineHeight:1.9 }}>
            Thank you for trusting us with your home.<br/>
            <span style={{ color:C.white, fontWeight:600 }}>We look forward to working with you! 🎨</span>
          </div>
        </div>

        <button onClick={onUpdate} style={{ width:"100%", padding:"13px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:10, color:C.muted, fontFamily:bf, fontSize:12, cursor:"pointer" }}>
          ← Go back and update my selection
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [prep,     setPrep]     = useState("standard");
  const [opts,     setOpts]     = useState({ foundation:true, pillars:false, deck_stain:false, handrails_basic:false, handrails_full:false, front_steps:false });
  const [upgs,     setUpgs]     = useState({ rear_deck:false, foundation_doors:false });
  const [view,     setView]     = useState("estimate");
  const [saveTime, setSaveTime] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notif,    setNotif]    = useState(null);
  const [fonts,    setFonts]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState("accepted");
  const [sentOk, setSentOk] = useState(false);
  const [sendError, setSendError] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap";
    link.onload = () => setFonts(true);
    document.head.appendChild(link);

    const saved = lsGet(STORAGE_KEY);
    if (saved) {
      if (saved.prep)     setPrep(saved.prep);
      if (saved.opts)     setOpts(saved.opts);
      if (saved.upgs)     setUpgs(saved.upgs);
      if (saved.saveTime) setSaveTime(saved.saveTime);
      if (saved.decision) setDecision(saved.decision);
      if (typeof saved.sentOk === "boolean") setSentOk(saved.sentOk);
      if (saved.sendError) setSendError(saved.sendError);
      if (saved.confirmed) setView("confirmed");
    }
    setLoading(false);
  }, []);

  const toggleOpt = (id) => {
    const item = OPTIONAL.find(i => i.id === id);
    setOpts(p => {
      const n = { ...p, [id]: !p[id] };
      if (item?.exclusive && n[id]) {
        OPTIONAL
          .filter(i => i.exclusive === item.exclusive && i.id !== id)
          .forEach(i => { n[i.id] = false; });
      }
      return n;
    });
  };
  const toggleUpg = (id) => setUpgs(p => ({ ...p, [id]: !p[id] }));

  const prepObj    = PREP.find(p => p.id === prep);
  const prepPrice  = prepObj?.price || 800;
  const fixedTotal = FIXED.reduce((s,i) => s + i.price, 0);
  const optTotal   = OPTIONAL.reduce((s,i) => opts[i.id] ? s + i.price : s, 0);
  const upgTotal   = UPGRADES.reduce((s,i) => upgs[i.id] ? s + i.price : s, 0);
  const grandTotal = prepPrice + fixedTotal + optTotal + upgTotal;
  const p40  = Math.round(grandTotal * 0.40);
  const p30a = Math.round(grandTotal * 0.30);
  const p30b = grandTotal - p40 - p30a;

  const allSelections = [
    { label:`Preparation — ${prepObj?.label}`, price:prepPrice },
    ...FIXED.map(i => ({ label:i.label, price:i.price })),
    ...OPTIONAL.filter(i => opts[i.id]).map(i => ({ label:i.label, price:i.price })),
    ...UPGRADES.filter(i => upgs[i.id]).map(i => ({ label:i.label, price:i.price })),
  ];

  const selectedOptional = OPTIONAL.filter(i => opts[i.id]).map(i => `${i.label} — ${fmt(i.price)}`);
  const selectedUpgrades = UPGRADES.filter(i => upgs[i.id]).map(i => `${i.label} — ${fmt(i.price)}`);

  const submitSelection = async ({ decisionType }) => {
    const t = new Date().toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });
    setSubmitting(true);
    setNotif(decisionType === "accepted" ? "Sending selection..." : "Sending review request...");

    const payload = {
      _subject: `${ESTIMATE_NUM} — ${decisionType === "accepted" ? "ACCEPTED / SEND INVOICE" : "NOT ACCEPTED YET / REVIEW REQUEST"}`,
      estimate_number: ESTIMATE_NUM,
      property: PROPERTY,
      submitted_at: t,
      decision: decisionType === "accepted" ? "CLIENT ACCEPTED ESTIMATE" : "CLIENT DID NOT ACCEPT YET",
      send_invoice: decisionType === "accepted" ? "YES — send invoice" : "NO — review first",
      labor_total: fmt(grandTotal),
      payment_schedule: `40% ${fmt(p40)} / 30% ${fmt(p30a)} / 30% ${fmt(p30b)}`,
      preparation_level: `${prepObj?.label} — ${fmt(prepPrice)}`,
      base_work: FIXED.map(i => `${i.label} — ${fmt(i.price)}`).join("\n"),
      optional_services_selected: selectedOptional.length ? selectedOptional.join("\n") : "None",
      upgrades_selected: selectedUpgrades.length ? selectedUpgrades.join("\n") : "None",
      all_selected_services: allSelections.map(s => `${s.label} — ${fmt(s.price)}`).join("\n"),
      client_message: decisionType === "accepted"
        ? "Client accepted the estimate and requested invoice/start-date follow-up."
        : "Client submitted selections but did not approve invoice yet. Contact client before sending invoice.",
    };

    let emailSent = false;
    let errorMessage = null;

    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let details = "";
        try {
          const data = await res.json();
          details = data?.message ? ` ${data.message}` : "";
        } catch {}
        throw new Error(`Email service returned ${res.status}.${details}`);
      }

      emailSent = true;
    } catch (err) {
      errorMessage = err?.message || "Could not send email.";
    }

    setDecision(decisionType);
    setSaveTime(t);
    setSentOk(emailSent);
    setSendError(errorMessage);
    lsSet(STORAGE_KEY, {
      prep,
      opts,
      upgs,
      total: grandTotal,
      saveTime: t,
      confirmed: true,
      decision: decisionType,
      sentOk: emailSent,
      sendError: errorMessage
    });

    setSubmitting(false);
    setNotif(null);
    setView("confirmed");
  };

  const confirm = () => submitSelection({ decisionType: "accepted" });
  const requestReview = () => submitSelection({ decisionType: "review" });

  const bf = fonts ? "'DM Sans', sans-serif" : "sans-serif";
  const df = fonts ? "'Playfair Display', serif" : "Georgia, serif";

  if (loading) return (
    <div style={{ background:C.bg, color:C.white, display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:bf }}>
      <div style={{ color:C.gold }}>Loading estimate...</div>
    </div>
  );

  if (view === "confirmed") return (
    <ConfirmationScreen
      total={grandTotal}
      selections={allSelections}
      saveTime={saveTime}
      bf={bf}
      df={df}
      onUpdate={() => setView("estimate")}
      decision={decision}
      sentOk={sentOk}
      sendError={sendError}
    />
  );

  return (
    <div style={{ background:C.bg, color:C.white, minHeight:"100vh", fontFamily:bf, paddingBottom:110 }}>
      {notif && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", background:"#1A1A1A", border:`1px solid ${C.gold}`, color:C.white, padding:"12px 22px", borderRadius:10, zIndex:999, fontSize:13, boxShadow:"0 4px 30px rgba(0,0,0,.6)", fontWeight:500, whiteSpace:"nowrap" }}>
          {notif}
        </div>
      )}

      <div style={{ background:"linear-gradient(160deg,#120B00 0%,#090909 60%)", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:660, margin:"0 auto", padding:"24px 20px 20px" }}>
          <div style={{ background:"#1A0800", border:`1.5px solid ${C.orange}`, borderRadius:10, padding:"10px 16px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.orange }}>LABOR ONLY ESTIMATE</div>
              <div style={{ fontSize:11, color:"#B07040", marginTop:2, lineHeight:1.5 }}>Paint, primer, caulk and miscellaneous materials are quoted and billed separately.</div>
            </div>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:10, color:C.gold, letterSpacing:"3px", marginBottom:8, fontWeight:600 }}>CUSTOMIZABLE ESTIMATE</div>
              <div style={{ fontFamily:df, fontSize:24, fontWeight:700, lineHeight:1.2, marginBottom:4 }}>Exterior Painting</div>
              <div style={{ fontSize:12, color:C.muted }}>{PROPERTY}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:C.gold, letterSpacing:"2px", marginBottom:4 }}>{ESTIMATE_NUM}</div>
              <div style={{ fontSize:12, color:C.muted }}>{TODAY}</div>
              <div style={{ fontSize:11, color:"#D44A4A", marginTop:2, fontWeight:600 }}>⏰ Valid until {VALID_UNTIL}</div>
            </div>
          </div>

          <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
            {[["2,132 sq ft","total area"],["1,501 sq ft","net siding"],["312 lf","trim"],["15 windows · 2 doors",""]].map(([v,l],i) => (
              <div key={i} style={{ background:C.goldFaint, border:`1px solid ${C.goldBorder}`, borderRadius:8, padding:"5px 11px" }}>
                <span style={{ fontSize:11, color:C.goldLight, fontWeight:600 }}>{v}</span>
                {l && <span style={{ fontSize:10, color:C.muted, marginLeft:5 }}>{l}</span>}
              </div>
            ))}
          </div>

          <div style={{ marginTop:14, display:"inline-flex", alignItems:"center", gap:14, background:C.goldFaint, border:`1px solid ${C.goldBorder}`, borderRadius:40, padding:"10px 20px" }}>
            <span style={{ fontSize:12, color:C.muted }}>Your estimate (labor)</span>
            <span style={{ fontFamily:df, fontSize:24, color:C.goldLight, fontWeight:700 }}>{fmt(grandTotal)}</span>
          </div>

          <div style={{ marginTop:12, fontSize:12, color:C.muted, lineHeight:1.7 }}>
            👋 Customize your estimate by toggling optional services on or off. Base work is always included. Confirm at the bottom and our team will reach out with your invoice and start date.
          </div>
        </div>
      </div>

      <div style={{ maxWidth:660, margin:"0 auto", padding:"0 20px", boxSizing:"border-box" }}>
        <div style={{ paddingTop:24 }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.white, marginBottom:3 }}>1. Preparation Level</div>
            <div style={{ fontSize:12, color:C.muted }}>Choose your level — labor included in price</div>
          </div>
          <div style={{ display:"grid", gap:10 }}>
            {PREP.map(p => {
              const active = prep === p.id;
              return (
                <div key={p.id} onClick={() => setPrep(p.id)}
                  style={{ border:`1.5px solid ${active?p.color:C.border}`, background:active?`${p.color}12`:C.card, borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all .15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                        <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${active?p.color:C.muted2}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {active && <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }} />}
                        </div>
                        <span style={{ fontSize:14, fontWeight:700, color:active?C.white:"#999" }}>{p.label}</span>
                        <span style={{ fontSize:9, fontWeight:700, letterSpacing:"1.5px", color:p.color, background:`${p.color}22`, padding:"3px 8px", borderRadius:20 }}>{p.tag}</span>
                      </div>
                      {p.items.map((it,i) => <div key={i} style={{ fontSize:12, color:active?"#B8B8B8":C.muted2, marginBottom:2, paddingLeft:26 }}>· {it}</div>)}
                      <div style={{ fontSize:11, fontStyle:"italic", color:active?p.color:C.muted2, marginTop:6, paddingLeft:26 }}>{p.note}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontFamily:df, fontSize:20, fontWeight:600, color:active?p.color:C.muted }}>{fmt(p.price)}</div>
                      <div style={{ fontSize:9, color:C.muted2, marginTop:2 }}>labor only</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:10, padding:"10px 14px", background:"#0D0D00", border:`1px solid #2A2800`, borderRadius:8, fontSize:11, color:"#999", lineHeight:1.6 }}>
            ⚠️ <strong style={{ color:"#D4C46A" }}>Note:</strong> This wood siding has cracked paint and exposed wood throughout. Insufficient prep will cause premature paint failure.
          </div>
        </div>

        <div style={{ paddingTop:24 }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.white, marginBottom:3 }}>2. Base Work — Always Included</div>
            <div style={{ fontSize:12, color:C.muted }}>Fixed in all estimates — cannot be removed</div>
          </div>
          <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${C.greenBorder}` }}>
            {FIXED.map((item,i) => (
              <div key={item.id} style={{ background:C.greenFaint, borderBottom:i<FIXED.length-1?`1px solid ${C.greenBorder}`:"none", padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                <div style={{ display:"flex", gap:10, flex:1 }}>
                  <span style={{ fontSize:18, flexShrink:0, marginTop:2 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:C.white, marginBottom:3 }}>{item.label}</div>
                    <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{item.desc}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:C.green }}>{fmt(item.price)}</div>
                  <div style={{ fontSize:9, color:"#3A8A5A", marginTop:2 }}>✓ included</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:8 }}>
            <span style={{ fontSize:12, color:C.muted }}>Base subtotal: </span>
            <span style={{ fontSize:12, fontWeight:700, color:C.white, marginLeft:8 }}>{fmt(fixedTotal)}</span>
          </div>
        </div>

        <div style={{ paddingTop:24 }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.white, marginBottom:3 }}>3. Optional Services</div>
            <div style={{ fontSize:12, color:C.muted }}>Toggle on or off — total updates instantly</div>
          </div>
          <div style={{ display:"grid", gap:8 }}>
            {OPTIONAL.map(item => {
              const isOn = opts[item.id];
              const sisterOn = item.exclusive && OPTIONAL.some(i => i.exclusive===item.exclusive && i.id!==item.id && opts[i.id]);
              return (
                <div key={item.id} onClick={() => toggleOpt(item.id)}
                  style={{ border:`1.5px solid ${isOn?C.gold:C.border}`, background:isOn?C.selectedBg:C.card, borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all .15s", opacity:sisterOn && !isOn ? 0.35 : 1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                    <div style={{ display:"flex", gap:8, flex:1 }}>
                      <div style={{ width:20, height:20, borderRadius:item.exclusive?"50%":5, flexShrink:0, marginTop:1, border:`2px solid ${isOn?C.gold:C.border}`, background:isOn?C.gold:"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>
                        {isOn && <span style={{ fontSize:item.exclusive?9:11, color:"#000", fontWeight:700 }}>{item.exclusive?"●":"✓"}</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
                          <span style={{ fontSize:16 }}>{item.icon}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:isOn?C.white:"#999" }}>{item.label}</span>
                          {item.badge && <span style={{ fontSize:9, fontWeight:700, color:C.gold, background:`${C.gold}22`, padding:"2px 7px", borderRadius:20, letterSpacing:1 }}>{item.badge}</span>}
                          {item.exclusive && <span style={{ fontSize:9, color:C.muted2, fontStyle:"italic" }}>pick one</span>}
                        </div>
                        <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:isOn?C.goldLight:C.muted }}>{fmt(item.price)}</div>
                      <div style={{ fontSize:10, marginTop:2, color:isOn?C.green:C.muted2 }}>{isOn?"✓ included":"tap to add"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ paddingTop:24 }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.white, marginBottom:3 }}>4. Upgrades</div>
            <div style={{ fontSize:12, color:C.muted }}>Additional improvements — add what you need</div>
          </div>
          <div style={{ display:"grid", gap:8 }}>
            {UPGRADES.map(item => {
              const isOn = upgs[item.id];
              return (
                <div key={item.id} onClick={() => toggleUpg(item.id)}
                  style={{ border:`1.5px solid ${isOn?C.purple:C.border}`, background:isOn?C.purpleFaint:C.card, borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all .15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
                    <div style={{ display:"flex", gap:8, flex:1 }}>
                      <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, marginTop:1, border:`2px solid ${isOn?C.purple:C.border}`, background:isOn?C.purple:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {isOn && <span style={{ fontSize:11, color:"#fff", fontWeight:700 }}>✓</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
                          <span style={{ fontSize:16 }}>{item.icon}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:isOn?C.white:"#999" }}>{item.label}</span>
                          {item.badge && <span style={{ fontSize:9, fontWeight:700, color:item.includesMaterials?C.orange:C.purple, background:item.includesMaterials?`${C.orange}25`:`${C.purple}25`, padding:"2px 7px", borderRadius:20, letterSpacing:1 }}>{item.badge}</span>}
                        </div>
                        <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:isOn?"#C4A0FF":C.muted }}>{fmt(item.price)}</div>
                      <div style={{ fontSize:10, marginTop:2, color:isOn?C.green:C.muted2 }}>{isOn?"✓ included":"tap to add"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ paddingTop:24 }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.white, marginBottom:3 }}>Payment Schedule — 40 / 30 / 30</div>
            <div style={{ fontSize:12, color:C.muted }}>Based on your current selection of {fmt(grandTotal)}</div>
          </div>
          <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}` }}>
            {[
              { icon:"📅", label:"To reserve your start date", amount:p40, pct:"40%", desc:"Due upon signing to hold your date" },
              { icon:"🔨", label:"Upon completion of prep", amount:p30a, pct:"30%", desc:"Due when all prep work is finished" },
              { icon:"🎨", label:"Upon completion of painting", amount:p30b, pct:"30%", desc:"Final payment when job is done" },
            ].map((step,i) => (
              <div key={i} style={{ padding:"13px 16px", borderBottom:i<2?`1px solid ${C.border}`:"none", background:i%2===0?C.card:C.card2, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center", flex:1 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:C.goldFaint, border:`1px solid ${C.goldBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:14 }}>{step.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:C.white }}>{step.label}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{step.desc}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:C.goldLight }}>{fmt(step.amount)}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{step.pct}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingTop:24 }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.white }}>Your Selection Summary</div>
          </div>
          <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}` }}>
            <LineItem label={`Preparation — ${prepObj?.label}`} price={prepPrice} color={prepObj?.color} />
            {FIXED.map(i  => <LineItem key={i.id}  label={i.label}  price={i.price}  color={C.green}  />)}
            {OPTIONAL.filter(i => opts[i.id]).map(i  => <LineItem key={i.id} label={i.label} price={i.price} color={C.gold}   />)}
            {UPGRADES.filter(i => upgs[i.id]).map(i  => <LineItem key={i.id} label={i.label} price={i.price} color={C.purple} />)}
            <div style={{ padding:"16px 18px", background:"linear-gradient(135deg,#130D00,#0A0A0A)", borderTop:`1px solid ${C.goldBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:11, color:C.muted, letterSpacing:"1px", marginBottom:2 }}>TOTAL — LABOR ONLY</div>
                <div style={{ fontSize:10, color:C.orange }}>⚠️ Materials billed separately</div>
              </div>
              <div style={{ fontFamily:df, fontSize:28, fontWeight:700, color:C.goldLight }}>{fmt(grandTotal)}</div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop:24 }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.white, marginBottom:3 }}>📈 Why This Project Is Worth It</div>
            <div style={{ fontSize:12, color:C.muted }}>Return on investment — Russellville, AR market</div>
          </div>
          <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}` }}>
            {ROI.map((r,i) => (
              <div key={i} style={{ padding:"14px 16px", borderBottom:i<ROI.length-1?`1px solid ${C.border}`:"none", background:i%2===0?C.card:C.card2 }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:5 }}>
                      <span style={{ fontSize:15 }}>{r.icon}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:C.white }}>{r.title}</span>
                    </div>
                    <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>{r.note}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.goldLight, textAlign:"right", flexShrink:0 }}>{r.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:20, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.white, marginBottom:8 }}>📋 Terms & Conditions</div>
          {[
            ["LABOR ONLY — Paint, primer, caulk and miscellaneous materials are quoted and billed separately.", true],
            ["Estimate valid for 14 days from issue date (May 22, 2026).", false],
            ["Payment plan: 40% to reserve date · 30% upon prep completion · 30% upon painting completion.", false],
            ["Any rotten or damaged wood found during prep will be quoted separately before replacement.", false],
            ["1-year workmanship warranty on all labor.", false],
          ].map(([t,warn],i) => (
            <div key={i} style={{ fontSize:11, color:warn?C.orange:C.muted, marginBottom:4, lineHeight:1.6, fontWeight:warn?500:400 }}>· {t}</div>
          ))}
        </div>

        <div style={{ paddingTop:20, paddingBottom:8 }}>
          <button disabled={submitting} onClick={confirm} style={{ width:"100%", padding:"16px 20px", background:`linear-gradient(135deg,${C.gold},#E8A030)`, border:"none", borderRadius:12, color:"#000", fontFamily:bf, fontSize:15, fontWeight:700, cursor:submitting?"not-allowed":"pointer", opacity: submitting ? 0.75 : 1 }}>
            {submitting ? "Sending..." : "Accept Selection & Request Invoice →"}
          </button>

          <button disabled={submitting} onClick={requestReview} style={{ width:"100%", marginTop:10, padding:"13px 20px", background:"transparent", border:`1px solid ${C.borderLight}`, borderRadius:12, color:C.muted, fontFamily:bf, fontSize:13, fontWeight:600, cursor:submitting?"not-allowed":"pointer", opacity: submitting ? 0.75 : 1 }}>
            Not Ready Yet — Send My Selection for Review
          </button>

          <div style={{ textAlign:"center", fontSize:11, color:C.muted2, marginTop:8, lineHeight:1.5 }}>
            Accepting tells Omega Home Solutions to prepare/send the invoice. Review means do not send invoice yet.
          </div>
        </div>
      </div>

      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(10,8,0,.97)", borderTop:`1px solid ${C.goldBorder}`, backdropFilter:"blur(12px)", padding:"10px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", zIndex:100, boxSizing:"border-box" }}>
        <div>
          <div style={{ fontSize:9, color:C.orange, letterSpacing:"1px", marginBottom:1 }}>LABOR ONLY · MATERIALS BILLED SEPARATELY</div>
          <div style={{ fontFamily:df, fontSize:21, color:C.goldLight, fontWeight:700 }}>{fmt(grandTotal)}</div>
        </div>
        <button disabled={submitting} onClick={confirm} style={{ background:C.gold, border:"none", borderRadius:8, color:"#000", padding:"11px 22px", fontFamily:bf, fontSize:13, fontWeight:700, cursor:submitting?"not-allowed":"pointer", opacity: submitting ? 0.75 : 1 }}>
          {submitting ? "Sending..." : "Accept →"}
        </button>
      </div>
    </div>
  );
}
