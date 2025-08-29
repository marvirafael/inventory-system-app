export default function Logo({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  }

  return (
    <div className={`${sizeClasses[size]} mx-auto mb-4`}>
      <img 
        src="/icon-192x192.png" 
        alt="Syntropic Acceleration Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  )
}
