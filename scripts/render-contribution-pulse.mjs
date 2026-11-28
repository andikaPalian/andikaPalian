import { readFileSync } from 'node:fs';

const weeks = JSON.parse(readFileSync(0, 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const completeWeeks = weeks
  .map(week => week.contributionDays)
  .filter(days => days.length === 7 && days.at(-1).date < today)
  .slice(-12);

if (completeWeeks.length !== 12) {
  throw new Error('Expected 12 complete weeks of GitHub contribution data');
}

const weeklyTotals = completeWeeks.map(days =>
  days.reduce((total, day) => total + day.contributionCount, 0),
);
const total = weeklyTotals.reduce((sum, count) => sum + count, 0);
const ceiling = Math.max(1, ...weeklyTotals);
const formatDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
const startDate = formatDate.format(new Date(completeWeeks[0][0].date));
const endDate = formatDate.format(new Date(completeWeeks.at(-1).at(-1).date));
const baseline = 174;
const bars = weeklyTotals.map((count, index) => {
  const height = count === 0 ? 3 : Math.max(5, Math.round(count / ceiling * 106));
  const x = 344 + 44 * index;
  const fill = count === 0 ? '#43355b' : 'url(#bar)';
  return `    <rect class="bar" x="${x}" y="${baseline - height}" width="28" height="${height}" rx="4" fill="${fill}" style="--delay:${index * 38}ms"><title>${count} contributions</title></rect>`;
}).join('\n');

console.log(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 232" role="img" aria-labelledby="title description">
  <title id="title">GitHub Contribution Pulse</title>
  <desc id="description">${total} contributions across 12 complete weeks. Weekly counts from ${startDate} to ${endDate}, oldest first: ${weeklyTotals.join(', ')}.</desc>
  <defs>
    <linearGradient id="bar" x1="0" x2="0" y1="1" y2="0">
      <stop stop-color="#9367f0"/>
      <stop offset="1" stop-color="#ffc1e7"/>
    </linearGradient>
    <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#bca3fa" opacity=".25"/>
    </pattern>
  </defs>
  <style>
    @media (prefers-reduced-motion: no-preference) {
      .bar { transform-box: fill-box; transform-origin: bottom; animation: rise .6s var(--delay) ease-out both; }
      @keyframes rise { from { transform: scaleY(.12); } }
    }
  </style>
  <rect x="2" y="2" width="896" height="228" rx="17" fill="#211639" stroke="#7254ae" stroke-width="3"/>
  <path d="M34 49h30l9-14 10 24 10-10h32" fill="none" stroke="#ffc1e7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M252 20h49v192h-87z" fill="url(#dots)"/>
  <path d="M307 28v176M329 68h542m-542 35h542m-542 35h542m-542 36h542" fill="none" stroke="#544272" stroke-width="1.5"/>
  <g font-family="system-ui, sans-serif">
    <text x="34" y="87" fill="#decdf7" font-size="20" font-weight="700">Last 12 complete weeks</text>
    <text x="31" y="155" fill="#fff6ff" font-size="58" font-weight="800">${total.toLocaleString('en-US')}</text>
    <text x="34" y="190" fill="#decdf7" font-size="20">Contributions</text>
    <text x="344" y="48" fill="#decdf7" font-size="19" font-weight="600">Contributions per week</text>
${bars}
    <text x="344" y="206" fill="#decdf7" font-size="18">${startDate}</text>
    <text x="856" y="206" fill="#decdf7" font-size="18" text-anchor="end">${endDate}</text>
  </g>
</svg>`);
