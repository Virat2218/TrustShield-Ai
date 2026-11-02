import json
from sqlalchemy.orm import Session
from database import ScamAlert

REAL_CYBERSECURITY_ADVISORIES = [
    {
        "title": "Digital Arrest: Fraudsters Impersonating CBI & Police over Video Calls",
        "category": "Digital Arrest",
        "risk_level": "High",
        "description": "Criminal syndicates pose as police, CBI, Customs, or court officials via Skype or WhatsApp video calls, staging mock police stations to intimidate victims into transferring their savings to so-called 'safe government verification accounts'.",
        "how_it_works": "Victims receive a call claiming a parcel sent in their name containing narcotics or fake passports was intercepted by Customs or FedEx. The caller connects them via Skype to accomplices in fake police uniforms sitting in front of police logos. They claim an arrest warrant has been issued and order 24/7 video surveillance ('Digital Arrest'). Under extreme duress, victims are coerced into liquidating FDs, mutual funds, and transferring all money to 'Supreme Court/RBI reserve accounts'.",
        "warning_signs": [
            "Callers claim to be police, ED, CBI, or judges demanding video calls on Skype/WhatsApp",
            "Threats of immediate arrest warrants or detention unless you maintain continuous video contact",
            "Directives not to inform family, lawyers, or local police under 'national security secrecy'",
            "Demands to transfer funds into secret 'government holding accounts' or 'RBI verification accounts' for clearance"
        ],
        "prevention_tips": [
            "Indian law enforcement and judicial authorities NEVER conduct arrests or court proceedings via Skype or video call",
            "No legitimate agency ever asks citizens to transfer money to personal or temporary bank accounts for verification",
            "Immediately disconnect such calls and report to the National Cyber Crime Helpline at 1930 or cybercrime.gov.in",
            "Verify any summons or notices directly with your local police station in person"
        ],
        "source_name": "Indian Cyber Crime Coordination Centre (I4C) & CERT-In",
        "source_url": "https://www.cert-in.org.in"
    },
    {
        "title": "Electricity Bill Non-Payment Disconnection SMS & APK Malware",
        "category": "Electricity Bill Scam",
        "risk_level": "High",
        "description": "Scammers send urgent SMS messages warning that the recipient's power supply will be disconnected tonight at 9:30 PM due to an unpaid previous month's bill, giving an unofficial mobile number for 'electricity executive assistance'.",
        "how_it_works": "The SMS creates panic with urgent deadlines (e.g. 'Dear Consumer, Your electricity power will be disconnected tonight at 9.30 pm from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer Mr. Sharma on 98XXXXXXXX.'). When the victim calls, the fraudster instructs them to install an Android APK (such as 'DiscomHelp.apk' or 'QuickSupport/AnyDesk') or make a token payment of Rs. 10. The malware captures screen activity, steals banking credentials, and intercepts OTPs to empty bank accounts.",
        "warning_signs": [
            "SMS sent from random 10-digit mobile numbers or alphanumeric headers not registered with your state DISCOM",
            "Threats of electricity cutoff within hours (usually late evening)",
            "Instructions to call a personal mobile number instead of the official DISCOM toll-free hotline",
            "Requests to install remote access applications (AnyDesk, TeamViewer) or download an APK file from WhatsApp/SMS"
        ],
        "prevention_tips": [
            "Power utility companies never send disconnection notices via personal WhatsApp or 10-digit mobile numbers",
            "Always check bill status and make payments only through the official state electricity portal, official consumer app, or BBPS (Bharat BillPay)",
            "Never download third-party APK files sent via SMS or messaging apps",
            "Never install screen sharing applications on request of unknown callers"
        ],
        "source_name": "Ministry of Power & PIB Fact Check",
        "source_url": "https://pib.gov.in/FactCheck.aspx"
    },
    {
        "title": "Work-From-Home & Telegram 'YouTube Like & Review' Task Fraud",
        "category": "Telegram Task Scam",
        "risk_level": "High",
        "description": "Victims are enticed with flexible part-time remote work paying Rs. 3,000 to Rs. 8,000 per day simply for liking YouTube videos, rating Google Maps locations, or reviewing hotels on Telegram.",
        "how_it_works": "Recruiters reach out via WhatsApp offering micro-tasks. Initial tasks give real small payouts (Rs. 150 to Rs. 500) directly into UPI accounts to build trust. Victims are then added to VIP Telegram groups filled with bots posting fake earnings screenshots. They are prompted to participate in 'prepaid investment tasks' or 'crypto tasks' where they must invest Rs. 5,000 to get Rs. 8,000. Once large amounts (lakhs of rupees) are deposited, withdrawals are blocked with demands for 'tax clearance fees' or 'unfreezing fees' until the victim has lost everything.",
        "warning_signs": [
            "Unsolicited job offers on WhatsApp or Telegram offering high daily returns for simple liking or rating tasks",
            "Payment requests to 'unlock higher tier tasks' or 'deposit security margins'",
            "Telegram group admins presenting fake certificates and fabricated member profit screenshots",
            "Withdrawal demands blocked with excuses regarding system errors, score penalties, or tax requirements"
        ],
        "prevention_tips": [
            "Legitimate companies never ask job candidates or workers to pay money upfront to receive tasks or earnings",
            "Treat any job communication migrating from WhatsApp to anonymous Telegram channels as fraudulent",
            "Never transfer funds to individual savings accounts disguised as corporate merchant accounts",
            "Report suspect Telegram channels and UPI handles to 1930 and bank fraud helplines immediately"
        ],
        "source_name": "Indian Cybercrime Coordination Centre (I4C)",
        "source_url": "https://cybercrime.gov.in"
    },
    {
        "title": "Malicious Android Trojan APKs Disguised as Wedding Invites & PM Schemes",
        "category": "Fake APK Malware",
        "risk_level": "High",
        "description": "Attackers circulate WhatsApp attachments ending in .apk disguised as 'Wedding_Invitation.apk', 'PM_Kisan_Yojana.apk', or 'Traffic_Challan_Notice.apk' that secretly hijack Android SMS permissions and steal 2FA tokens.",
        "how_it_works": "Victims receive a message from acquaintances whose phones were already infected, or from unknown numbers, inviting them to view a wedding card or claiming an unpaid e-challan traffic fine. Clicking the file prompts the installation of an APK application. Once granted accessibility and SMS permissions, the Trojan hides its app icon, reads incoming bank OTPs, logs keystrokes, and propagates itself to all contacts in the victim's address book.",
        "warning_signs": [
            "Files received over WhatsApp or SMS ending with the '.apk' extension instead of '.pdf', '.jpg', or web links",
            "Installation warnings from Android Play Protect stating 'Blocked by Play Protect: Harmful app'",
            "Application requests excessive permissions: SMS reading, call log access, Accessibility services",
            "Sudden unauthorized outbound SMS messages sent from your phone to contact lists"
        ],
        "prevention_tips": [
            "Never enable 'Install from unknown sources' or install .apk files received over messaging platforms",
            "Check traffic challans only on the official government Parivahan portal (https://echallan.parivahan.gov.in)",
            "Keep Google Play Protect enabled on your Android smartphone at all times",
            "If accidentally installed, immediately turn on Airplane Mode, back up important personal media, and perform a factory reset"
        ],
        "source_name": "CERT-In Cyber Security Advisory CIAD-2024",
        "source_url": "https://www.cert-in.org.in"
    },
    {
        "title": "UPI QR Code Reverse Payment & Overpayment Refund Fraud",
        "category": "UPI QR Code Scam",
        "risk_level": "Medium",
        "description": "Scammers pretending to buy second-hand goods on OLX/Facebook Marketplace or send government subsidies trick users into scanning a QR code or entering their UPI PIN under the false pretense of 'receiving' funds.",
        "how_it_works": "The scammer expresses eager interest to purchase an item listed online and offers to pay an advance via UPI. They send a QR code or payment request link, instructing the seller: 'Scan this QR code and enter your UPI PIN to accept the funds into your bank account'. In reality, scanning a QR code or entering a UPI PIN is strictly for DEBITING (paying) money. The moment the user enters their PIN, funds are debited from their account rather than credited.",
        "warning_signs": [
            "Buyer refuses in-person meeting or cash payment and insists on immediate online transfer via QR code",
            "Buyer claims: 'You must enter your UPI PIN to verify and receive the money in your account'",
            "Buyer sends a 'Payment Request' notification on Google Pay or PhonePe labeled 'Refund' or 'Payment Approved'",
            "Aggressive urgency or claims of accidental double payment"
        ],
        "prevention_tips": [
            "GOLDEN UPI RULE: You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money",
            "Entering your UPI PIN ALWAYS debits money from your account",
            "Reject payment collect requests from unfamiliar parties",
            "Never carry out financial transactions based on assurances from anonymous online marketplace buyers"
        ],
        "source_name": "National Payments Corporation of India (NPCI) & RBI",
        "source_url": "https://www.npci.org.in"
    },
    {
        "title": "Fake Customer Support & Bank Toll-Free Numbers on Google Maps and Search",
        "category": "Customer Care Fraud",
        "risk_level": "Medium",
        "description": "Fraudsters edit contact details of banks, airlines, couriers, and hospital customer desks on Google Maps and search results with their own private numbers to intercept panicked customers seeking refund or parcel support.",
        "how_it_works": "When a customer searches for courier support (BlueDart, DTDC), airline refund helplines, or bank customer care, they encounter fraudulent numbers submitted by scammers on Google Maps business listings or fraudulent search ads. Upon calling, the fake agent speaks professionally, confirms fake booking details, and convinces the caller to download remote control software or make a small registration fee via UPI, which is then used to siphon funds.",
        "warning_signs": [
            "Customer care number listed is a standard 10-digit mobile number starting with 6/7/8/9 rather than an official 1800 toll-free number",
            "Representative asks for debit card CVV, expiry dates, or banking passwords to 'initiate refund'",
            "Representative insists you install AnyDesk, RustDesk, or TeamViewer so they can 'guide your refund screen'",
            "Demands a test transaction of Rs. 1 or Rs. 10 to link your bank account"
        ],
        "prevention_tips": [
            "Never search Google or Google Maps for customer service phone numbers",
            "Obtain official support contacts strictly from the physical back of your debit/credit card or the verified official banking website",
            "Legitimate customer support executives never ask for OTPs, CVVs, or remote screen sharing access",
            "Check for official verified green checkmarks and SSL certificates on official domain websites"
        ],
        "source_name": "Reserve Bank of India (RBI) Cautionary Advisory",
        "source_url": "https://www.rbi.org.in"
    },
    {
        "title": "High-Yield 'Pig Butchering' Forex & Crypto Investment Fraud",
        "category": "Investment Scams",
        "risk_level": "High",
        "description": "Sophisticated transnational syndicates build romantic rapport or friendship over months before steering victims to rigged cryptocurrency and stock trading websites promising 50% to 200% monthly yields.",
        "how_it_works": "The fraud begins with a seemingly accidental wrong-number text on WhatsApp or LinkedIn. Over weeks of friendly conversation, the scammer displays luxurious lifestyle photos and casually mentions insider knowledge on foreign exchange (forex) or crypto arbitrage. The victim is guided to a fake trading portal (e.g. imitation MT5 clone) that displays simulated skyrocketing profits. When the victim attempts to withdraw funds, the platform freezes the account, demanding 30% taxes and liquidity verification deposits until the victim is completely drained.",
        "warning_signs": [
            "Romantic interest or internet friend who rapidly brings up lucrative investments, cryptocurrency, or gold trading",
            "Guarantees of 0% risk with returns vastly exceeding realistic market benchmarks",
            "Investment platforms hosted on obscure domains not registered with SEBI, SEC, or national financial regulators",
            "Demands for upfront fee payments or taxes in cryptocurrency prior to permitting withdrawals"
        ],
        "prevention_tips": [
            "Verify that any stockbroker or investment advisor is formally registered with SEBI on the official SEBI registry (sebi.gov.in)",
            "Never take investment advice from individuals met through social media, dating apps, or unsolicited messages",
            "Remember: Higher return invariably comes with higher risk; guaranteed high return is guaranteed fraud",
            "Report unauthorized forex and binary trading platforms on the RBI Alert List"
        ],
        "source_name": "Securities and Exchange Board of India (SEBI) & RBI Alert List",
        "source_url": "https://www.sebi.gov.in"
    }
]

def seed_scam_alerts(db: Session):
    """Seeds authoritative real-world cybersecurity advisories if none exist."""
    existing_count = db.query(ScamAlert).count()
    if existing_count == 0:
        for adv in REAL_CYBERSECURITY_ADVISORIES:
            alert = ScamAlert(
                title=adv["title"],
                category=adv["category"],
                risk_level=adv["risk_level"],
                description=adv["description"],
                how_it_works=adv["how_it_works"],
                warning_signs=json.dumps(adv["warning_signs"]),
                prevention_tips=json.dumps(adv["prevention_tips"]),
                source_name=adv["source_name"],
                source_url=adv["source_url"],
                is_published=True,
            )
            db.add(alert)
        db.commit()

