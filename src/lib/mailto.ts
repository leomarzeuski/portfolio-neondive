const EMAIL = 'leomarzeuskii@gmail.com'
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateContact(name: string, email: string, message: string): boolean {
  return name.trim().length >= 2 && RE_EMAIL.test(email.trim()) && message.trim().length >= 10
}

export function buildMailto(name: string, email: string, message: string): string {
  const subject = `[NEON DIVE] ${name.trim()} — portfolio contact`
  const body = `${message.trim()}\n\n— ${name.trim()} <${email.trim()}>`
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
