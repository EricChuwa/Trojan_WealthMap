import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

interface Alert {
  id: number;
  title: string;
  description: string;
  category: string;
  severity: "Critical" | "High" | "Medium";
  warningSigns: string[];
  whatToDo: string[];
}

const FALLBACK_ALERTS: Alert[] = [
  {
    id: 1,
    title: "The 'Wrong Number' Mobile Money Transfer",
    description:
      "Someone calls saying they sent money to your phone number by mistake and begs you to send it back. But when you check, no money was ever added to your account — or they sent a fake SMS confirmation that looks like a receipt.",
    category: "Mobile Money Fraud",
    severity: "Critical",
    warningSigns: [
      "You get a text message that looks like a mobile money receipt, but your balance has not changed.",
      "The caller sounds desperate and rushes you to send money back immediately before you can check.",
    ],
    whatToDo: [
      "Always check your actual balance using your official app or shortcode (*182# etc.).",
      "Never send money back without confirming with your provider's customer care.",
    ],
  },
  {
    id: 2,
    title: "Daily Task & YouTube Online Liking Jobs",
    description:
      "You are invited to a group (on WhatsApp or Telegram) where people claim to make easy money just by liking videos or completing simple tasks online. They ask you to deposit money to 'unlock' higher-paying tasks or VIP status.",
    category: "Investment Scam",
    severity: "High",
    warningSigns: [
      "Promises of making large amounts of money for very little work.",
      "You are forced to pay or 'recharge' your account to get paid or continue.",
    ],
    whatToDo: [
      "Do not send any deposit. Legitimate companies do not make you pay to start working.",
      "Leave these groups immediately and block the organizers.",
    ],
  },
  {
    id: 3,
    title: "Easy Loans with Hidden Costs",
    description:
      "An app promises quick, emergency loans with no credit checks. Once you download the app, it demands access to your phone contacts and charges extremely high interest rates, threatening to shame you to your friends if you are late.",
    category: "Fake Loan App",
    severity: "Critical",
    warningSigns: [
      "The app asks for access to your contacts, photos, and messages before giving a loan.",
      "The repayment fee changes suddenly or is much higher than promised.",
    ],
    whatToDo: [
      "Never download loan apps from outside the official Google Play Store or Apple App Store.",
      "Do not grant contact list permissions to apps you don't trust.",
    ],
  },
  {
    id: 4,
    title: "Government Grant Registration Fee",
    description:
      "A website or message says you have been chosen for a government grant or charity cash giveaway. To receive the cash, you must pay a processing or registration fee.",
    category: "Fake Grant",
    severity: "Medium",
    warningSigns: [
      "You have to pay money to get 'free' money.",
      "The website address looks slightly wrong or uses a free web builder.",
    ],
    whatToDo: [
      "Remember: a real grant will never ask you to pay money to receive it.",
      "Check official government websites directly, not via links in WhatsApp messages.",
    ],
  },
  {
    id: 5,
    title: "The WhatsApp 'Family Member in Distress'",
    description:
      "Someone messages you from an unknown number using a photo of a family member. They claim their phone is broken, they have an emergency, and they need you to send money to a specific number right away.",
    category: "Impersonation Scam",
    severity: "High",
    warningSigns: [
      "The person claims to be your child, sibling, or parent but uses a new, unknown number.",
      "They claim to have a critical emergency and ask for money urgently.",
    ],
    whatToDo: [
      "Call the family member on their original number that you know to verify.",
      "Ask them a personal question only they would know the answer to.",
    ],
  },
];

export default function ScamAwareness() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const apiBase =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      let response;
      try {
        response = await fetch(`${apiBase}/fraud/alerts`);
      } catch {
        response = await fetch("/fraud/alerts");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }
      const json = await response.json();
      setAlerts(json.data || json);
    } catch (err) {
      console.warn("Backend unavailable, using rich local fallback data", err);
      setAlerts(FALLBACK_ALERTS);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || alert.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    ...Array.from(new Set(alerts.map((a) => a.category))),
  ];

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-amber-500";
      default:
        return "bg-yellow-400";
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-text-primary flex flex-col font-body">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-10 w-full relative">
        <Link
          to="/learn"
          className="mb-8 text-xs md:text-sm text-text-muted hover:text-white transition-colors flex items-center gap-2 inline-flex"
        >
          <span>←</span>
          <span>Back to Financial Courses</span>
        </Link>

        <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/10 to-red-500/5 blur-3xl pointer-events-none" />

        <div className="mb-10 bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 md:p-5 flex items-start gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div>
            <h2 className="font-semibold text-amber-400 text-sm md:text-base mb-1 font-body">
              Golden Safety Rule
            </h2>
            <p className="text-xs md:text-sm text-text-muted leading-relaxed">
              Trojan WealthMap, your bank, or mobile money providers will{" "}
              <strong className="text-text-primary">NEVER</strong> call or
              message to ask for your{" "}
              <strong className="text-text-primary">
                PIN, password, or security codes
              </strong>
              . If someone asks you to send money to "activate" or "verify" an
              account, hang up immediately!
            </p>
          </div>
        </div>

        <div className="mb-10 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Security Layer
          </span>
          <h1 className="font-display text-4xl md:text-5xl bg-gradient-to-r from-text-primary via-gold-light to-amber-500 bg-clip-text text-transparent mt-1 mb-3">
            Scam Alerts
          </h1>
          <p className="text-text-muted max-w-2xl text-sm md:text-base leading-relaxed">
            Scammers are smart, but you can be smarter. Learn to recognize the
            common tactics they use, spot the warning signs, and find out
            exactly what to do if a deal feels off.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-5 shadow-md">
              <h3 className="font-display text-xl mb-4">Find & Filter</h3>

              <div className="relative mb-5">
                <input
                  type="text"
                  placeholder="Search scams or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-obsidian border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <span className="absolute left-3 top-3 text-text-muted">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-text-muted mb-2 font-semibold">
                  Scam Categories
                </p>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs md:text-sm transition-all flex items-center justify-between ${
                      selectedCategory === category
                        ? "bg-amber-500/10 border border-amber-500/40 text-amber-400 font-medium"
                        : "bg-transparent border border-transparent text-text-muted hover:bg-obsidian hover:text-text-primary"
                    }`}
                  >
                    <span>{category}</span>
                    {selectedCategory === category && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-md">
              <h3 className="font-display text-xl text-amber-400 mb-3">Quick Safety Tips</h3>
              <ul className="space-y-3 text-xs md:text-sm text-text-muted leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>
                    <strong>Slow Down:</strong> Scammers always create false
                    urgency. Never rush.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>
                    <strong>Verify Separately:</strong> Look up contact info
                    yourself. Never use contacts provided in a suspicious
                    message.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>
                    <strong>Talk to Someone:</strong> Run the offer by a trusted
                    friend or family member before deciding.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-xl p-6 space-y-4 animate-pulse"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-border rounded w-1/4" />
                      <div className="h-6 bg-border rounded-full w-16" />
                    </div>
                    <div className="h-6 bg-border rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-border rounded w-full" />
                      <div className="h-4 bg-border rounded w-5/6" />
                    </div>
                    <div className="h-8 bg-border rounded w-full" />
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredAlerts.length > 0 && (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-500/20 group relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${getSeverityBorderColor(alert.severity)}`} />

                    <div className="mb-3.5 pl-2">
                      <span className="text-xs font-semibold tracking-wider uppercase text-amber-500">
                        {alert.category}
                      </span>
                    </div>

                    <div className="pl-2 mb-4">
                      <h3 className="font-display text-2xl mb-2 text-text-primary">
                        {alert.title}
                      </h3>
                      <p className="text-text-muted text-xs md:text-sm leading-relaxed">
                        {alert.description}
                      </p>
                    </div>

                    <details
                      className="group border-t border-border mt-4 pt-4 pl-2"
                      name="scam-alerts"
                    >
                      <summary className="text-xs md:text-sm font-semibold text-text-muted group-hover:text-text-primary cursor-pointer list-none flex items-center justify-between select-none">
                        <span>How to spot & protect yourself</span>
                        <span className="text-amber-500 group-open:rotate-180 transition-transform duration-200">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                      </summary>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs md:text-sm">
                        <div className="bg-obsidian/40 border border-border/40 rounded-lg p-4 space-y-2.5">
                          <h4 className="font-semibold text-red-400 mb-2">Red Flags to Watch</h4>
                          {alert.warningSigns.map((sign, idx) => (
                            <div
                              key={idx}
                              className="flex gap-2 text-text-muted leading-relaxed"
                            >
                              <span className="text-red-500/80">•</span>
                              <span>{sign}</span>
                            </div>
                          ))}
                        </div>

                        <div className="bg-obsidian/40 border border-border/40 rounded-lg p-4 space-y-2.5">
                          <h4 className="font-semibold text-emerald-400 mb-2">Safe Action to Take</h4>
                          {alert.whatToDo.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex gap-2 text-text-muted leading-relaxed"
                            >
                              <span className="text-emerald-500/80">•</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredAlerts.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-8 text-center shadow-md">
                <div className="mb-3">
                  <svg className="w-8 h-8 mx-auto text-text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="font-display text-xl mb-1 text-text-primary">
                  No scams found
                </h3>
                <p className="text-text-muted text-xs md:text-sm max-w-sm mx-auto mb-4 leading-relaxed">
                  We couldn't find any alert matching "{searchQuery}". Try
                  adjusting your filters or search keywords.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="px-4 py-2 bg-amber-500 text-obsidian rounded-lg text-xs font-semibold hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Reset Search & Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
