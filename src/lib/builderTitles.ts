// Builder Class titles — Goa/hacker-themed
// To add a new title: simply append a string to this array.
// The reroll function automatically avoids repeating the current class.

export const builderClasses = [
  // Goa Nature + Beach
  "Palm Wrangler",
  "Kokum Cooler Coder",
  "Monsoon Debugger",
  "Tide Chaser Engineer",
  "Mangrove Architect",
  "Coastal Cache Buster",
  "Beachhead Builder",
  "Spice Route Hacker",
  "Sunset Stack Overflow",
  "Reef Recursion Lord",
  "Cashew Kernel Dev",
  "Feni Fueled Founder",
  "Arabian Sea Admiral",

  // Hacker / Dev Culture
  "Pixel Crafter",
  "Terminal Castaway",
  "Prompt Sorcerer",
  "Model Whisperer",
  "Async Awaiter",
  "Type Enforcer",
  "Chaos Engineer",
  "Merge Conflict Solver",
  "Deploy Commander",
  "Zero Day Adventurer",
  "Kernel Coconut",
  "Token Economist",
  "State Machine Shaman",
  "Regex Archaeologist",
  "Loop Unroller",
  "Cache Invalidator",

  // Aviation / Boarding Pass
  "Gate 26 Gangster",
  "First Class Founder",
  "Boarding Bridge Breaker",
  "Turbulence Handler",
  "Clearance Level Jungle",
  "Priority Boarding Bro",

  // Absurdist Dev
  "Wifi Password Seeker",
  "Cold Brew Cold Start",
  "Infinite Scroll Surfer",
  "404 Island Explorer",
  "Deadline Devourer",
  "Standup Survivor",
  "Retrospective Rebel",
];

export function getRandomBuilderClass(current?: string): string {
  const pool = builderClasses.filter((c) => c !== current);
  return pool[Math.floor(Math.random() * pool.length)] ?? builderClasses[0];
}

export function getBuilderClassForStack(stack: string): string {
  const s = stack.toLowerCase();
  if (s.includes("front") || s.includes("ui") || s.includes("react") || s.includes("css") || s.includes("design"))
    return "Pixel Crafter";
  if (s.includes("ai") || s.includes("ml") || s.includes("llm") || s.includes("data") || s.includes("model"))
    return "Model Whisperer";
  if (s.includes("rust") || s.includes("c++") || s.includes("systems") || s.includes("kernel"))
    return "Kernel Coconut";
  if (s.includes("back") || s.includes("api") || s.includes("node") || s.includes("go") || s.includes("python"))
    return "Async Awaiter";
  if (s.includes("devops") || s.includes("cloud") || s.includes("k8s") || s.includes("infra"))
    return "Deploy Commander";
  if (s.includes("web3") || s.includes("crypto") || s.includes("blockchain"))
    return "Token Economist";
  if (s.includes("sec") || s.includes("pentest") || s.includes("hack"))
    return "Zero Day Adventurer";
  return getRandomBuilderClass();
}
