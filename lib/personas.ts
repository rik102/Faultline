export type Persona = {
  id: string;
  name: string;
  lens: string;
  goal: string;
  riskBias: string;
  patience: number;
  trust: number;
};

export const personas: Persona[] = [
  {
    id: "elderly-low-tech",
    name: "Low-tech older adult",
    lens: "low confidence with modern web patterns, careful reader, worried about mistakes",
    goal: "complete the primary flow without feeling tricked or lost",
    riskBias: "password wording, icons without labels, unclear next steps",
    patience: 38,
    trust: 46
  },
  {
    id: "distracted-parent",
    name: "Distracted single parent",
    lens: "time-constrained, multitasking, scanning rather than reading",
    goal: "finish quickly while avoiding surprise charges",
    riskBias: "dense copy, long forms, interrupted checkout, ambiguous payment language",
    patience: 31,
    trust: 52
  },
  {
    id: "impatient-shopper",
    name: "Impatient shopper",
    lens: "fast-moving, price-sensitive, intolerant of friction",
    goal: "understand value and complete purchase with minimal steps",
    riskBias: "hidden fees, slow confirmation, forced account creation",
    patience: 22,
    trust: 41
  },
  {
    id: "non-native-speaker",
    name: "Non-native English speaker",
    lens: "literal interpretation, sensitive to idioms and vague labels",
    goal: "understand each action without relying on cultural context",
    riskBias: "idioms, legal phrasing, labels like continue, vague error states",
    patience: 49,
    trust: 55
  },
  {
    id: "visual-overload",
    name: "Visually overwhelmed user",
    lens: "sensitive to clutter, contrast, competing calls to action, and dense layouts",
    goal: "identify the correct action without cognitive overload",
    riskBias: "too many choices, low contrast, animation, crowded forms",
    patience: 35,
    trust: 48
  },
  {
    id: "scammer",
    name: "Scammer / exploit seeker",
    lens: "adversarial, probes refund, support, promo, and authorization loopholes",
    goal: "find a path to misuse the product or extract unintended value",
    riskBias: "refund policy gaps, authorization confusion, weak identity checks",
    patience: 64,
    trust: 18
  }
];
