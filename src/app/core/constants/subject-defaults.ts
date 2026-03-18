/** Default colors and SVG icons for subjects when BE doesn't provide icon */

interface SubjectVisual {
  color: string;
  svg: string;
}

const SUBJECT_VISUALS: Record<string, SubjectVisual> = {
  'tiếng anh': {
    color: '#e8f0fe',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <rect x="12" y="16" width="56" height="48" rx="6" fill="#4285F4" opacity="0.15"/>
      <rect x="16" y="20" width="48" height="40" rx="4" fill="#4285F4" opacity="0.25"/>
      <text x="40" y="46" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="#1a73e8">EN</text>
    </svg>`
  },
  'toán': {
    color: '#fce8e6',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="28" fill="#EA4335" opacity="0.15"/>
      <text x="40" y="35" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#c5221f">∑ π</text>
      <text x="40" y="53" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#c5221f">x²+1</text>
    </svg>`
  },
  'vật lý': {
    color: '#e6f4ea',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="28" fill="#34A853" opacity="0.15"/>
      <circle cx="40" cy="40" r="6" fill="#1e8e3e"/>
      <ellipse cx="40" cy="40" rx="24" ry="10" stroke="#1e8e3e" stroke-width="2" fill="none" opacity="0.6"/>
      <ellipse cx="40" cy="40" rx="24" ry="10" stroke="#1e8e3e" stroke-width="2" fill="none" opacity="0.6" transform="rotate(60 40 40)"/>
      <ellipse cx="40" cy="40" rx="24" ry="10" stroke="#1e8e3e" stroke-width="2" fill="none" opacity="0.6" transform="rotate(120 40 40)"/>
    </svg>`
  },
  'hóa học': {
    color: '#fef7e0',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <rect x="12" y="12" width="56" height="56" rx="10" fill="#FBBC04" opacity="0.15"/>
      <path d="M32 22V42L22 58H58L48 42V22" stroke="#f29900" stroke-width="2.5" fill="#FBBC04" fill-opacity="0.2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="30" y1="22" x2="50" y2="22" stroke="#f29900" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="38" cy="50" r="3" fill="#f29900"/>
      <circle cx="45" cy="46" r="2" fill="#ea8600"/>
    </svg>`
  },
  'sinh học': {
    color: '#f3e8fd',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="28" fill="#A142F4" opacity="0.12"/>
      <path d="M40 18C40 18 28 28 28 40C28 52 40 62 40 62C40 62 52 52 52 40C52 28 40 18 40 18Z" fill="#A142F4" fill-opacity="0.25" stroke="#7627bb" stroke-width="2"/>
      <line x1="40" y1="22" x2="40" y2="58" stroke="#7627bb" stroke-width="1.5"/>
      <path d="M30 35C35 35 40 30 40 30C40 30 45 35 50 35" stroke="#7627bb" stroke-width="1.5" fill="none"/>
      <path d="M30 45C35 45 40 40 40 40C40 40 45 45 50 45" stroke="#7627bb" stroke-width="1.5" fill="none"/>
    </svg>`
  },
  'lịch sử': {
    color: '#e8eaed',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="28" fill="#5F6368" opacity="0.12"/>
      <circle cx="40" cy="40" r="20" stroke="#5F6368" stroke-width="2.5" fill="none"/>
      <line x1="40" y1="24" x2="40" y2="40" stroke="#5F6368" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="40" y1="40" x2="52" y2="46" stroke="#5F6368" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="2.5" fill="#5F6368"/>
    </svg>`
  },
  'địa lý': {
    color: '#e4f7fb',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="26" fill="#00ACC1" opacity="0.15" stroke="#00838f" stroke-width="2"/>
      <ellipse cx="40" cy="40" rx="12" ry="26" stroke="#00838f" stroke-width="1.5" fill="none"/>
      <line x1="14" y1="32" x2="66" y2="32" stroke="#00838f" stroke-width="1.5"/>
      <line x1="14" y1="48" x2="66" y2="48" stroke="#00838f" stroke-width="1.5"/>
      <line x1="40" y1="14" x2="40" y2="66" stroke="#00838f" stroke-width="1.5"/>
    </svg>`
  },
  'ngữ văn': {
    color: '#fce4ec',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <rect x="20" y="14" width="40" height="52" rx="4" fill="#E91E63" opacity="0.12" stroke="#c2185b" stroke-width="2"/>
      <line x1="28" y1="26" x2="52" y2="26" stroke="#c2185b" stroke-width="2" stroke-linecap="round"/>
      <line x1="28" y1="34" x2="48" y2="34" stroke="#c2185b" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <line x1="28" y1="42" x2="52" y2="42" stroke="#c2185b" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <line x1="28" y1="50" x2="44" y2="50" stroke="#c2185b" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <path d="M44 56L48 52L52 56" stroke="#c2185b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  'giáo dục công dân': {
    color: '#e0f2f1',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="28" fill="#009688" opacity="0.12"/>
      <circle cx="40" cy="30" r="8" stroke="#00796b" stroke-width="2" fill="none"/>
      <path d="M24 56C24 46 32 40 40 40C48 40 56 46 56 56" stroke="#00796b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M34 20L40 14L46 20" stroke="#00796b" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  'tin học': {
    color: '#e3f2fd',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <rect x="14" y="18" width="52" height="36" rx="4" fill="#1565C0" opacity="0.15" stroke="#1565C0" stroke-width="2"/>
      <line x1="30" y1="58" x2="50" y2="58" stroke="#1565C0" stroke-width="2" stroke-linecap="round"/>
      <line x1="40" y1="54" x2="40" y2="58" stroke="#1565C0" stroke-width="2"/>
      <text x="40" y="40" text-anchor="middle" font-family="monospace" font-size="12" fill="#1565C0">&lt;/&gt;</text>
    </svg>`
  }
};

// Fallback for unknown subjects
const DEFAULT_VISUAL: SubjectVisual = {
  color: '#f0f4f8',
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
    <rect x="14" y="14" width="52" height="52" rx="10" fill="#607D8B" opacity="0.12"/>
    <path d="M30 24H50L52 54H28L30 24Z" stroke="#607D8B" stroke-width="2" fill="none"/>
    <line x1="32" y1="32" x2="48" y2="32" stroke="#607D8B" stroke-width="1.5" opacity="0.6"/>
    <line x1="32" y1="38" x2="46" y2="38" stroke="#607D8B" stroke-width="1.5" opacity="0.6"/>
    <line x1="32" y1="44" x2="44" y2="44" stroke="#607D8B" stroke-width="1.5" opacity="0.6"/>
  </svg>`
};

export function getSubjectVisual(subjectName: string): SubjectVisual {
  const key = subjectName.toLowerCase().trim();
  return SUBJECT_VISUALS[key] ?? DEFAULT_VISUAL;
}
