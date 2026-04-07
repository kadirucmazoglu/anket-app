import { useState, useEffect, useRef } from "react";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbynBcra8j4dGCUEgRGxNIDy1QqnriAdVDaTZWjap3o7pcZKQapJ0Z6vIsqvljLwEDLh/exec";

const pageVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ── Sayfa 1: Hoş Geldiniz ── */
function WelcomePage({ onStart }) {
  return (
    <div className="page">
      <div className="card">
        <div className="badge">📋 Anket</div>
        <h1 className="title">Anketimize<br />Hoşgeldiniz</h1>
        <p className="subtitle">
          Görüşleriniz bizim için çok değerli.<br />
          Yalnızca birkaç saniyenizi alacak.
        </p>
        <button className="btn btn-primary" onClick={onStart}>
          <span>Ankete Başla</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
    </div>
  );
}

/* ── Sayfa 2: Telefon Girişi ── */
function PhonePage({ onSubmit }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Müzik için bir referans oluşturuyoruz.
  // useRef kullanıyoruz çünkü Audio nesnesini render'lar arasında
  // kaybetmeden tutmamız gerekiyor.
  const audioRef = useRef(null);

  useEffect(() => {
    // public klasöründeki music.mp3 dosyasını yüklüyoruz.
    // Dosyayı projenin /public klasörüne atmayı unutma!
    audioRef.current = new Audio("/music.mp3");

    // Müzik bitince başa dönsün
    audioRef.current.loop = true;

    // Ses seviyesi (0.0 - 1.0 arası, 0.5 = %50)
    audioRef.current.volume = 0.5;

    // Müziği çalmaya başlıyoruz.
    // .catch(() => {}) → Tarayıcılar bazen kullanıcı etkileşimi
    // olmadan sesi engelliyor. Biz zaten butona tıklanarak buraya
    // geldiğimiz için sorun çıkmaz, ama yine de hata varsa
    // sessizce geçiyoruz ki uygulama çökmüyor.
    audioRef.current.play().catch(() => {});

    // Cleanup: Kullanıcı başka sayfaya geçince müzik durur.
    // useEffect'in return'ü component unmount olunca çalışır.
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Sıfırla, tekrar gelince baştan başlasın
    };
  }, []); // [] → Bu effect sadece component ilk yüklendiğinde çalışır

  function formatPhone(val) {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return digits.slice(0, 4) + " " + digits.slice(4);
    if (digits.length <= 9) return digits.slice(0, 4) + " " + digits.slice(4, 7) + " " + digits.slice(7);
    return digits.slice(0, 4) + " " + digits.slice(4, 7) + " " + digits.slice(7, 9) + " " + digits.slice(9);
  }

  function handleChange(e) {
    setError("");
    setPhone(formatPhone(e.target.value));
  }

  async function handleSubmit() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Lütfen geçerli bir telefon numarası girin.");
      return;
    }
    setLoading(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          date: new Date().toLocaleString("tr-TR"),
        }),
      });
    } catch (e) {
      // no-cors modunda hata yakalamak zor, devam ediyoruz
    }
    setLoading(false);
    onSubmit(phone);
  }

  return (
    <div className="page">
      <div className="card">
        <div className="step-indicator">
          <span className="step active" />
          <span className="step active" />
          <span className="step" />
        </div>
        <h2 className="title small">İletişim Bilgisi</h2>
        <p className="subtitle">
          Lütfen telefon numaranızı giriniz.
        </p>
        <div className={cn("input-wrapper", error && "has-error")}>
          <span className="input-prefix">🇹🇷</span>
          <input
            type="tel"
            placeholder="05XX XXX XX XX"
            value={phone}
            onChange={handleChange}
            className="phone-input"
            autoFocus
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <span>Gönder</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </button>
      </div>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
    </div>
  );
}

/* ── Sayfa 3: Teşekkürler ── */
function ThankYouPage({ phone }) {
  return (
    <div className="page">
      <div className="card">
        <div className="check-circle">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="title small">Katıldığınız İçin<br />Teşekkür Ederiz!</h2>
        <p className="subtitle">
          <strong>{phone}</strong> numaralı telefonunuz<br />
          başarıyla kaydedildi.
        </p>
        <p className="footnote">Yanıtlarınız bize çok yardımcı oldu 💙</p>
      </div>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
    </div>
  );
}

/* ── Ana App ── */
export default function App() {
  const [page, setPage] = useState(1);
  const [phone, setPhone] = useState("");

  function handleSubmit(p) {
    setPhone(p);
    setPage(3);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Sora', sans-serif;
          background: #0d0f1a;
          min-height: 100vh;
          color: #f0f0f5;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          pointer-events: none;
          animation: pulse 8s ease-in-out infinite alternate;
        }
        .blob-1 {
          width: 420px; height: 420px;
          background: #4f6ef7;
          top: -100px; right: -100px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 340px; height: 340px;
          background: #a855f7;
          bottom: -80px; left: -60px;
          animation-delay: 2s;
        }
        @keyframes pulse {
          from { transform: scale(1); }
          to   { transform: scale(1.15); }
        }

        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 48px 40px;
          max-width: 440px;
          width: 100%;
          position: relative;
          z-index: 1;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
        }

        .badge {
          display: inline-block;
          background: rgba(79,110,247,0.18);
          border: 1px solid rgba(79,110,247,0.35);
          color: #8ba4ff;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 28px;
        }

        .title {
          font-size: 42px;
          font-weight: 700;
          line-height: 1.15;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #fff 40%, #8ba4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .title.small { font-size: 32px; }

        .subtitle {
          color: rgba(240,240,245,0.55);
          font-size: 15px;
          line-height: 1.7;
          margin-bottom: 36px;
          font-weight: 300;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 28px;
          border-radius: 14px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        .btn-primary {
          background: linear-gradient(135deg, #4f6ef7, #7c3aed);
          color: #fff;
          box-shadow: 0 8px 32px rgba(79,110,247,0.35);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(79,110,247,0.5);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .step-indicator {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
        }
        .step {
          height: 4px;
          border-radius: 2px;
          flex: 1;
          background: rgba(255,255,255,0.1);
          transition: background 0.3s;
        }
        .step.active {
          background: linear-gradient(90deg, #4f6ef7, #7c3aed);
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 0 16px;
          margin-bottom: 12px;
          transition: border-color 0.2s;
        }
        .input-wrapper:focus-within {
          border-color: #4f6ef7;
          box-shadow: 0 0 0 3px rgba(79,110,247,0.15);
        }
        .input-wrapper.has-error {
          border-color: #f87171;
        }
        .input-prefix {
          font-size: 20px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .phone-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #f0f0f5;
          font-family: inherit;
          font-size: 16px;
          font-weight: 500;
          padding: 16px 0;
          letter-spacing: 0.04em;
        }
        .phone-input::placeholder { color: rgba(240,240,245,0.3); }

        .error-msg {
          color: #f87171;
          font-size: 13px;
          margin-bottom: 20px;
          margin-top: -4px;
        }

        .check-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f6ef7, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          box-shadow: 0 12px 32px rgba(79,110,247,0.4);
          animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .footnote {
          margin-top: 20px;
          color: rgba(240,240,245,0.35);
          font-size: 13px;
          font-weight: 300;
        }

        .spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {page === 1 && <WelcomePage onStart={() => setPage(2)} />}
      {page === 2 && <PhonePage onSubmit={handleSubmit} />}
      {page === 3 && <ThankYouPage phone={phone} />}
    </>
  );
}