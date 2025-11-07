import { NextResponse } from 'next/server';

const excuses = [
  "It works on my machine 🤷",
  "That's a feature, not a bug",
  "The code was working yesterday",
  "Must be a solar flare affecting the servers",
  "It's a race condition that only happens on Tuesdays",
  "The database is in a quantum superposition",
  "Mercury is in retrograde",
  "I didn't touch that file, I swear",
  "It's probably a caching issue",
  "Have you tried turning it off and on again?",
  "The documentation is outdated",
  "That's legacy code from the previous developer",
  "It's a known issue in the backlog",
  "Works fine in incognito mode",
  "The API must be down",
  "It's a timezone issue",
  "The tests are passing locally",
  "That's outside the scope of this sprint",
  "It's a browser compatibility issue",
  "The server needs more RAM",
  "It's because of the full moon",
  "The intern must have changed something",
  "It works in production but not in dev",
  "That's a client-side issue",
  "The network is slow today",
  "It's a floating point precision error",
  "The code is self-documenting",
  "That's how it's supposed to work",
  "It's a PEBKAC error (Problem Exists Between Keyboard And Chair)",
  "The cosmic rays flipped a bit",
];

export async function GET() {
  const randomExcuse = excuses[Math.floor(Math.random() * excuses.length)];
  
  const response = {
    excuse: randomExcuse,
    confidence: Math.floor(Math.random() * 100) + 1,
    timestamp: new Date().toISOString(),
    blame: ["frontend", "backend", "devops", "the intern", "cosmic rays"][Math.floor(Math.random() * 5)],
    willFixIn: `${Math.floor(Math.random() * 10) + 1} sprints`,
  };

  return NextResponse.json(response);
}
