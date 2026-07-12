const alerts = [
    {
        id: 1,
        title: "The 'Wrong Number' Mobile Money Transfer",
        description: "Someone calls saying they sent money to your phone number by mistake and begs you to send it back. But when you check, no money was ever added to your account — or they sent a fake SMS confirmation that looks like a receipt.",
        category: "Mobile Money Fraud",
        severity: "Critical",
        warningSigns: [
            "You get a text message that looks like a mobile money receipt, but your balance has not changed.",
            "The caller sounds desperate and rushes you to send money back immediately before you can check."
        ],
        whatToDo: [
            "Always check your actual balance using your official app or shortcode (*182# etc.).",
            "Never send money back without confirming with your provider's customer care."
        ]
    },
    {
        id: 2,
        title: "Daily Task & YouTube Online Liking Jobs",
        description: "You are invited to a group (on WhatsApp or Telegram) where people claim to make easy money just by liking videos or completing simple tasks online. They ask you to deposit money to 'unlock' higher-paying tasks or vip status.",
        category: "Investment Scam",
        severity: "High",
        warningSigns: [
            "Promises of making large amounts of money for very little work.",
            "You are forced to pay or 'recharge' your account to get paid or continue."
        ],
        whatToDo: [
            "Do not send any deposit. Legitimate companies do not make you pay to start working.",
            "Leave these groups immediately and block the organizers."
        ]
    },
    {
        id: 3,
        title: "Easy Loans with Hidden Costs",
        description: "An app promises quick, emergency loans with no credit checks. Once you download the app, it demands access to your phone contacts and charges extremely high interest rates, threatening to shame you to your friends if you are late.",
        category: "Fake Loan App",
        severity: "Critical",
        warningSigns: [
            "The app asks for access to your contacts, photos, and messages before giving a loan.",
            "The repayment fee changes suddenly or is much higher than promised."
        ],
        whatToDo: [
            "Never download loan apps from outside the official Google Play Store or Apple App Store.",
            "Do not grant contact list permissions to apps you don't trust."
        ]
    },
    {
        id: 4,
        title: "Government Grant Registration Fee",
        description: "A website or message says you have been chosen for a government grant or charity cash giveaway. To receive the cash, you must pay a processing or registration fee.",
        category: "Fake Grant",
        severity: "Medium",
        warningSigns: [
            "You have to pay money to get 'free' money.",
            "The website address looks slightly wrong or uses a free web builder."
        ],
        whatToDo: [
            "Remember: a real grant will never ask you to pay money to receive it.",
            "Check official government websites directly, not via links in WhatsApp messages."
        ]
    },
    {
        id: 5,
        title: "The WhatsApp 'Family Member in Distress'",
        description: "Someone messages you from an unknown number using a photo of a family member. They claim their phone is broken, they have an emergency, and they need you to send money to a specific number right away.",
        category: "Impersonation Scam",
        severity: "High",
        warningSigns: [
            "The person claims to be your child, sibling, or parent but uses a new, unknown number.",
            "They claim to have a critical emergency and ask for money urgently."
        ],
        whatToDo: [
            "Call the family member on their original number that you know to verify.",
            "Ask them a personal question only they would know the answer to."
        ]
    }
];

module.exports = alerts;
