// Simple blockchain avatar generator without external dependencies
export function generateAvatar(address: string): string {
  // Create a deterministic color based on address
  const hash = address.slice(2, 8)
  const hue = parseInt(hash, 16) % 360
  
  // Generate a gradient based on the address
  const hue2 = (hue + 60) % 360
  
  return `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${hue2}, 70%, 50%))`
}

export function getAvatarInitials(address: string): string {
  // Return first 2 characters after 0x
  return address.slice(2, 4).toUpperCase()
}

export function generateAvatarSVG(address: string): string {
  const hash = address.slice(2)
  const colors = []
  
  // Generate 4 colors from the address hash
  for (let i = 0; i < 4; i++) {
    const hue = parseInt(hash.slice(i * 6, i * 6 + 6), 16) % 360
    colors.push(`hsl(${hue}, 70%, 60%)`)
  }
  
  // Create a simple 4x4 grid pattern
  const blocks = []
  for (let i = 0; i < 16; i++) {
    const colorIndex = parseInt(hash[i], 16) % 4
    const show = parseInt(hash[i], 16) % 2 === 0
    if (show) {
      blocks.push({
        x: (i % 4) * 25,
        y: Math.floor(i / 4) * 25,
        color: colors[colorIndex]
      })
    }
  }
  
  return `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="hsl(${parseInt(hash.slice(0, 6), 16) % 360}, 30%, 20%)"/>
      ${blocks.map(b => `<rect x="${b.x}" y="${b.y}" width="25" height="25" fill="${b.color}"/>`).join('')}
    </svg>
  `
}
