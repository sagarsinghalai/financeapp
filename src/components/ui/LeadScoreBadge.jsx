export default function LeadScoreBadge({ score }) {
  const s = parseInt(score) || 0;
  if (s >= 70) return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">🔥 Hot · {s}</span>;
  if (s >= 40) return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">🌤 Warm · {s}</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">❄️ Cold · {s}</span>;
}
