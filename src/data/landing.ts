// Copy for the landing page, copied word for word from the reference design.

export const DOORS = [
  {
    k: "Calls",
    t: "Answered first",
    l: "Unknown numbers get an assistant that answers like an executive assistant\nAsks who is calling and why\nChecks online if the number is reported as a scam\nVerifies claims, like a sheriff's badge number\nOnly calls that check out ring Mom",
  },
  {
    k: "Texts",
    t: "Watched",
    l: 'Every text is watched as it arrives\nLikely scams are flagged and held\nCatches fake Medicare notices, "grandkid in trouble" stories and gift card demands',
  },
  {
    k: "Email",
    t: "Scanned",
    l: "Her inbox is scanned for phishing\nFake bank and delivery messages move to spam\nShe never has to read or judge them",
  },
];

export const FLOW = [
  { n: "1", t: "Spots it", d: "A likely scam is detected." },
  { n: "2", t: "Holds it", d: "Blocked or set aside." },
  { n: "3", t: "Tells the family", d: "Right away, with what to do." },
  { n: "4", t: "Tells Mom", d: "In plain, calm words." },
];

export const SCAMS = [
  { k: "FAKE MEDICARE", q: "Your Medicare card is expiring, confirm now.", d: "Caught in texts and calls." },
  { k: "FAMILY IN TROUBLE", q: "Grandma, it's me. I need money.", d: "Caught before it rings Mom." },
  { k: "GIFT CARDS", q: "Pay with gift cards to fix this.", d: "Flagged and held on arrival." },
  { k: "FAKE OFFICIALS", q: "This is Deputy Smith, badge 4471.", d: "Claims are verified, not trusted." },
];

export const WHO = [
  { t: "The parent, 70+", d: "Protected without changing a thing." },
  { t: "The family, about 40 to 65", d: "Adult children pay and get peace of mind." },
  { t: "Distance doesn't matter", d: "You hear right away, wherever you live." },
];

// Spec section 5: a fifth row, "Pricing", goes after "Optional deposit".
export const FACTS = [
  { k: "Cost to join", v: "Free" },
  { k: "Optional deposit", v: "$10, fully refundable" },
  { k: "Pricing", v: "Shared before launch" },
  { k: "Who goes first", v: "A small group of families" },
  { k: "Launch", v: "2027" },
];
