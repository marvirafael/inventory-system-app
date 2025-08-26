export default function Logo({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  }

  return (
    <div className={`${sizeClasses[size]} mx-auto mb-4`}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Sun rays */}
        <g stroke="#f59e0b" strokeWidth="4" fill="none">
          <line x1="100" y1="20" x2="100" y2="35" />
          <line x1="135" y1="25" x2="130" y2="38" />
          <line x1="165" y1="45" x2="155" y2="55" />
          <line x1="180" y1="75" x2="167" y2="80" />
          <line x1="185" y1="110" x2="172" y2="110" />
          <line x1="180" y1="145" x2="167" y2="140" />
          <line x1="165" y1="175" x2="155" y2="165" />
          <line x1="135" y1="195" x2="130" y2="182" />
          <line x1="100" y1="200" x2="100" y2="185" />
          <line x1="65" y1="195" x2="70" y2="182" />
          <line x1="35" y1="175" x2="45" y2="165" />
          <line x1="20" y1="145" x2="33" y2="140" />
          <line x1="15" y1="110" x2="28" y2="110" />
          <line x1="20" y1="75" x2="33" y2="80" />
          <line x1="35" y1="45" x2="45" y2="55" />
          <line x1="65" y1="25" x2="70" y2="38" />
        </g>
        
        {/* Sun circle */}
        <circle cx="100" cy="60" r="25" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        
        {/* Leaves */}
        <ellipse cx="85" cy="90" rx="12" ry="20" fill="#22c55e" transform="rotate(-15 85 90)" />
        <ellipse cx="100" cy="85" rx="12" ry="22" fill="#16a34a" />
        <ellipse cx="115" cy="90" rx="12" ry="20" fill="#22c55e" transform="rotate(15 115 90)" />
        
        {/* Leaf veins */}
        <g stroke="#15803d" strokeWidth="1" fill="none">
          <line x1="85" y1="75" x2="85" y2="105" transform="rotate(-15 85 90)" />
          <line x1="100" y1="65" x2="100" y2="105" />
          <line x1="115" y1="75" x2="115" y2="105" transform="rotate(15 115 90)" />
        </g>
        
        {/* Stem */}
        <rect x="98" y="105" width="4" height="25" fill="#f59e0b" />
        
        {/* Roots */}
        <g stroke="#f59e0b" strokeWidth="2" fill="none">
          <path d="M100 130 Q85 140 80 150" />
          <path d="M100 130 Q90 145 85 155" />
          <path d="M100 130 Q100 145 95 155" />
          <path d="M100 130 Q110 145 115 155" />
          <path d="M100 130 Q115 140 120 150" />
        </g>
        
        {/* Root endpoints */}
        <g fill="#f59e0b">
          <circle cx="80" cy="150" r="2" />
          <circle cx="85" cy="155" r="2" />
          <circle cx="95" cy="155" r="2" />
          <circle cx="115" cy="155" r="2" />
          <circle cx="120" cy="150" r="2" />
        </g>
      </svg>
    </div>
  )
}
