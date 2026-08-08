/**
 * Artist roster (§28). Representative entries for the prototype; CMS-managed in
 * production. No real likenesses — placeholders stand in for editorial portraits.
 */
export interface Artist {
  id: string;
  name: string;
  role: string;
  genre: string;
  model: string;
  quote: string;
  finishTint: [number, number, number];
}

export const ARTISTS: Artist[] = [
  { id: "a1", name: "Nadia Vermeer", role: "Guitarist", genre: "Progressive Metal", model: "STX8 Multiscale", quote: "It stays exactly where I set it — tour after tour, climate after climate.", finishTint: [138, 92, 246] },
  { id: "a2", name: "Kaito Mori", role: "Session / Producer", genre: "Studio", model: "070 Standard", quote: "The note definition down low is why it lives on my sessions.", finishTint: [63, 210, 190] },
  { id: "a3", name: "Elena Ferro", role: "Guitarist", genre: "Djent", model: "H/09 Headless", quote: "Nine strings, and it still balances like a six.", finishTint: [60, 190, 180] },
  { id: "a4", name: "Marcus Byrne", role: "Bassist", genre: "Fusion", model: "S/B6 Bass", quote: "Clarity on the low B I didn't think was possible.", finishTint: [92, 138, 206] },
  { id: "a5", name: "Sora Lindqvist", role: "Guitarist", genre: "Post-Rock", model: "T/0 Style", quote: "Familiar in the hands, unfamiliar in the sustain.", finishTint: [206, 132, 92] },
  { id: "a6", name: "Diego Salas", role: "Guitarist", genre: "Tech Death", model: "080S Multiscale", quote: "Detune to hell and every note still speaks.", finishTint: [126, 217, 87] },
];
