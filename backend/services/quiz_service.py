import json
from sqlalchemy.orm import Session
from database import QuizQuestion

CATEGORIES = [
    {"id": "all", "name": "Comprehensive Cyber Safety", "description": "General threat defense covering all scam tactics", "icon": "Shield"},
    {"id": "phishing", "name": "Phishing & Email Fraud", "description": "Identify spoofed emails, domain typos, and spear phishing", "icon": "Mail"},
    {"id": "upi", "name": "UPI & Payment Scams", "description": "Collect requests, QR code tricks, and payment gateway scams", "icon": "Smartphone"},
    {"id": "job", "name": "Fake Job & Task Scams", "description": "Work-from-home scams, YouTube like tasks, and visa fraud", "icon": "Briefcase"},
    {"id": "otp", "name": "OTP & Credential Theft", "description": "Call spoofing, SIM swap, and screen sharing app traps", "icon": "KeyRound"},
    {"id": "fake_website", "name": "Fake Websites & Lookalikes", "description": "Typosquatting, deceptive SSL locks, and clone bank portals", "icon": "Globe"},
    {"id": "investment", "name": "Crypto & Ponzi Schemes", "description": "Guaranteed 200% returns, Telegram pump-and-dump, and Forex apps", "icon": "TrendingUp"},
    {"id": "social_engineering", "name": "Social Engineering & Impersonation", "description": "Police digital arrest scams, urgent CEO demands, and emotional appeals", "icon": "UserCheck"},
]

DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]

SEED_QUESTIONS = [
    # Phishing
    {
        "category": "phishing",
        "difficulty": "Beginner",
        "question": "You receive an email claiming to be Netflix stating: 'Your payment was declined. Click here to reactivate your membership within 12 hours.' The sender address is 'support@netflix-account-renew.com'. What should you do?",
        "options": [
            "Click the link and re-enter your debit card details immediately",
            "Reply to the email asking for confirmation",
            "Ignore the link, delete the email, and verify account status directly on the official Netflix app or website",
            "Forward the email to friends to warn them"
        ],
        "correct_answer": 2,
        "explanation": "Official Netflix emails come from @netflix.com. The sender domain 'netflix-account-renew.com' is an unofficial lookalike domain designed to harvest billing credentials. Never click payment links in emails."
    },
    {
        "category": "phishing",
        "difficulty": "Intermediate",
        "question": "Which of the following is the strongest indicator of a spear phishing email directed at an organization employee?",
        "options": [
            "The email uses standard polite language",
            "The email displays an urgent request from the CEO to wire funds or purchase gift cards using an external lookalike email address",
            "The email comes from the internal HR system with standard monthly payroll advice",
            "The email contains the company logo"
        ],
        "correct_answer": 1,
        "explanation": "Executive impersonation (Business Email Compromise) uses high urgency, request for non-standard transactions, and external display names spoofing executives to bypass skepticism."
    },
    {
        "category": "phishing",
        "difficulty": "Advanced",
        "question": "How can you detect an Internationalized Domain Name (IDN) homograph attack where Cyrillic letters resemble Latin characters (e.g. 'googIe.com')?",
        "options": [
            "Look for the HTTPS padlock icon in the address bar",
            "Inspect the Punycode representation (e.g., 'xn--...') in browser address bar or certificate SAN fields",
            "Check if the website loads fast",
            "Reload the page three times"
        ],
        "correct_answer": 1,
        "explanation": "Homograph attacks register unicode domains visually identical to legitimate ones. Modern browsers convert them to Punycode ('xn--...'), which reveals non-Latin characters."
    },

    # UPI
    {
        "category": "upi",
        "difficulty": "Beginner",
        "question": "A buyer on OLX sends you a QR code on WhatsApp saying: 'Scan this QR code and enter your UPI PIN to receive ₹5,000 for your used furniture.' What happens if you scan and enter your PIN?",
        "options": [
            "₹5,000 will be credited directly to your bank account",
            "₹5,000 will be deducted and transferred to the scammer's account",
            "The transaction will be cancelled automatically",
            "Your bank will ask for your fingerprint"
        ],
        "correct_answer": 1,
        "explanation": "Entering a UPI PIN is strictly used to AUTHORIZE AN OUTGOING PAYMENT (deduct money). You NEVER need to enter a UPI PIN or scan a QR code to RECEIVE money."
    },
    {
        "category": "upi",
        "difficulty": "Intermediate",
        "question": "You receive a notification on your UPI app for a 'Collect Request' of ₹2,000 from an unknown VPA claiming to be 'Amazon Customer Care Refund'. What should you do?",
        "options": [
            "Accept the request and type your UPI PIN to claim the refund",
            "Decline/reject the collect request and report the VPA as spam in the UPI app",
            "Approve ₹1 first to test",
            "Send an SMS to the sender"
        ],
        "correct_answer": 1,
        "explanation": "A 'Collect Request' pulls money FROM your account. Legitimate customer care services never send collect requests to process a refund."
    },

    # Fake Jobs
    {
        "category": "job",
        "difficulty": "Beginner",
        "question": "You get a Telegram message offering a part-time job: 'Earn ₹3,000 to ₹10,000 daily by simply liking YouTube videos and rating hotels on Google Maps. No experience required.' Is this a legitimate job?",
        "options": [
            "Yes, big tech companies hire freelance video likers",
            "Yes, as long as they pay ₹50 for the first task",
            "No, this is a classic prepaid task scam designed to lure you into depositing larger sums into fraudulent crypto/investment wallets",
            "Yes, if they provide a company registration number"
        ],
        "correct_answer": 2,
        "explanation": "This is the prevalent 'Task Scam'. Scammers pay a small initial incentive (₹100–₹500) to build trust, then trap victims into paying thousands for 'VIP tasks' that cannot be withdrawn."
    },
    {
        "category": "job",
        "difficulty": "Intermediate",
        "question": "A recruiter contacts you via LinkedIn offering a remote job with high salary, but asks you to pay ₹3,500 upfront for 'laptop courier insurance and background check fee'. What is the correct response?",
        "options": [
            "Pay the fee because insurance is a standard hiring cost",
            "Refuse and report the recruiter; legitimate employers never demand upfront fees from job candidates",
            "Offer to pay half the fee upfront",
            "Ask for their personal bank account details"
        ],
        "correct_answer": 1,
        "explanation": "Under labor laws and corporate compliance, genuine employers bear the cost of onboarding and background checks. Any demand for recruitment fees or equipment insurance is fraudulent."
    },

    # OTP Fraud
    {
        "category": "otp",
        "difficulty": "Beginner",
        "question": "A caller identifies themselves as a Senior Manager from your bank's fraud control unit: 'We noticed a fraudulent charge of ₹45,000 on your card. To block this transaction immediately, please read out the 6-digit OTP sent to your phone.' What should you do?",
        "options": [
            "Quickly share the OTP so the transaction is cancelled",
            "Immediately hang up and never share the OTP; bank employees are strictly forbidden from asking for customer OTPs",
            "Share the first 3 digits only",
            "Tell them to guess the OTP"
        ],
        "correct_answer": 1,
        "explanation": "The caller IS the scammer initiating the fraudulent charge! If you share the OTP, you are authorizing the charge. Real banks will NEVER ask for your OTP over the phone."
    },
    {
        "category": "otp",
        "difficulty": "Intermediate",
        "question": "An electricity bill collector asks you to install 'AnyDesk', 'TeamViewer', or 'QuickSupport' on your phone to resolve an unpaid power bill error. Why is this extremely dangerous?",
        "options": [
            "It consumes heavy mobile data",
            "It grants the scammer remote screen-viewing and control access to your phone, allowing them to read incoming OTPs and bank credentials in real-time",
            "It drains your phone battery quickly",
            "It turns off your Wi-Fi"
        ],
        "correct_answer": 1,
        "explanation": "Remote access apps display your device screen to the attacker. Once granted access, scammers prompt you to make a small transaction and watch you enter your PIN and OTP."
    },

    # Fake Websites
    {
        "category": "fake_website",
        "difficulty": "Beginner",
        "question": "Does a green padlock icon and 'https://' in your browser's address bar mean a website is 100% verified and legitimate?",
        "options": [
            "Yes, only government-verified businesses can obtain HTTPS certificates",
            "No, HTTPS only means communication is encrypted between you and the server; scammers can easily obtain free SSL certificates for fake domains",
            "Yes, Google Chrome blocks all malicious HTTPS sites",
            "Yes, banks guarantee all HTTPS sites"
        ],
        "correct_answer": 1,
        "explanation": "HTTPS provides transport layer encryption, not identity verification. Anyone, including scammers, can generate free SSL certificates for malicious websites in under two minutes."
    },
    {
        "category": "fake_website",
        "difficulty": "Advanced",
        "question": "Which security mechanism enforces that your browser communicates with a specific domain only via HTTPS and prevents SSL stripping attacks?",
        "options": [
            "CORS (Cross-Origin Resource Sharing)",
            "HSTS (HTTP Strict Transport Security)",
            "Robots.txt",
            "DNSSEC"
        ],
        "correct_answer": 1,
        "explanation": "HSTS is a web security policy mechanism that forces browsers to interact with web servers only over secure HTTPS connections, protecting against downgrade attacks."
    },

    # Investment
    {
        "category": "investment",
        "difficulty": "Beginner",
        "question": "A WhatsApp group admin claims: 'Guaranteed 20% daily returns on Bitcoin and algorithmic trading. 100% zero risk. Regulated by SEBI & RBI.' What is the truth?",
        "options": [
            "It is legitimate if other group members post payment screenshots",
            "It is mathematically impossible and an obvious Ponzi/investment scam; no legitimate investment offers guaranteed high returns with zero risk",
            "It is safe if you invest only ₹500",
            "It is approved by government authorities"
        ],
        "correct_answer": 1,
        "explanation": "In finance, higher returns always carry higher risk. Any scheme offering 'guaranteed high returns with zero risk' is an illegal Ponzi or fake trading app scam."
    },

    # Social Engineering
    {
        "category": "social_engineering",
        "difficulty": "Intermediate",
        "question": "You receive a video call on Skype/WhatsApp from a person in a police uniform claiming you are under 'Digital Arrest' for a package containing narcotics found at Mumbai Customs. What should you know?",
        "options": [
            "Digital Arrest is a real Indian legal procedure where you must stay on video call and transfer bail money",
            "Indian law and police enforcement have NO concept of 'Digital Arrest'; this is a severe psychological extortion scam. Disconnect immediately and call 1930",
            "You should wire ₹50,000 verification fee immediately to avoid arrest",
            "You should stay on camera for 24 hours"
        ],
        "correct_answer": 1,
        "explanation": "Law enforcement agencies (Police, CBI, ED, Customs) never conduct investigations or place citizens under 'Digital Arrest' via Skype, WhatsApp, or video calls."
    },
    {
        "category": "social_engineering",
        "difficulty": "Advanced",
        "question": "What is 'Vishing' combined with caller ID spoofing?",
        "options": [
            "A virus that attacks computer sound cards",
            "Voice phishing where attackers impersonate trusted institutions and falsify caller ID displays to mirror official toll-free bank numbers",
            "An antivirus feature in smartphones",
            "A social media live streaming scam"
        ],
        "correct_answer": 1,
        "explanation": "Caller ID spoofing manipulates VoIP headers so your phone displays the official bank helpline number, even though the call originates from a fraudster."
    }
]

def seed_quiz_questions(db: Session):
    """Populates quiz questions if database table is empty."""
    count = db.query(QuizQuestion).count()
    if count == 0:
        for q in SEED_QUESTIONS:
            record = QuizQuestion(
                question=q["question"],
                options=json.dumps(q["options"]),
                correct_answer=q["correct_answer"],
                explanation=q["explanation"],
                category=q["category"],
                difficulty=q["difficulty"],
            )
            db.add(record)
        db.commit()

def get_recommendations_for_score(category: str, percentage: int, incorrect_categories: list[str]) -> list[str]:
    recs = []
    if percentage >= 80:
        recs.append("Excellent cybersecurity awareness! Continue staying vigilant against emerging AI voice cloning and deepfake fraud.")
        recs.append("Share your knowledge with family members and elderly relatives who are most vulnerable to call-based scams.")
    elif percentage >= 50:
        recs.append("Moderate security foundation, but certain deceptive tactics can still catch you off guard.")
        recs.append("Remember the golden rule: Never enter UPI PINs or share OTPs to receive funds under any circumstance.")
        recs.append("Always verify unexpected payment requests by calling official support numbers directly.")
    else:
        recs.append("Critical threat vulnerability: Your risk of falling for phishing or social engineering is high.")
        recs.append("Review official guidelines on https://cybercrime.gov.in and dial 1930 immediately if you suspect an active fraud.")
        recs.append("Never download screen-sharing applications (AnyDesk, TeamViewer) at the request of an unknown caller.")

    for cat in set(incorrect_categories):
        if cat == "upi":
            recs.append("Review UPI Security: UPI PIN is strictly for debiting money, never for receiving money or winning prizes.")
        elif cat == "otp":
            recs.append("Review OTP Safeguards: Banks, delivery agents, and police will NEVER ask you for an OTP.")
        elif cat == "phishing":
            recs.append("Review Phishing Tactics: Always inspect the exact email sender domain and avoid clicking unexpected links.")

    return recs[:4]

