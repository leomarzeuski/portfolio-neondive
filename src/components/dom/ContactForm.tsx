'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { t } from '@/lib/i18n'
import { validateContact, buildMailto } from '@/lib/mailto'

export default function ContactForm() {
  const lang = useApp((s) => s.lang)
  const [status, setStatus] = useState<'idle' | 'error' | 'ok'>('idle')
  const [mailto, setMailto] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '')
    const email = String(data.get('email') ?? '')
    const message = String(data.get('message') ?? '')
    if (!validateContact(name, email, message)) {
      setStatus('error')
      setMailto(null)
      return
    }
    const url = buildMailto(name, email, message)
    setMailto(url)
    setStatus('ok')
    try {
      window.location.href = url
    } catch {
      /* headless/bloqueado — o link manual cobre */
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <label>
        {t(lang, 'form.name')}
        <input name="name" type="text" placeholder={t(lang, 'form.name_ph')} />
      </label>
      <label>
        {t(lang, 'form.email')}
        <input name="email" type="email" placeholder={t(lang, 'form.email_ph')} />
      </label>
      <label>
        {t(lang, 'form.msg')}
        <textarea name="message" rows={4} placeholder={t(lang, 'form.msg_ph')} />
      </label>
      <button type="submit" className="cta">{t(lang, 'form.submit')}</button>
      {status !== 'idle' && (
        <p className="form-status" role="status">
          {t(lang, status === 'ok' ? 'form.ok' : 'form.err')}
        </p>
      )}
      {mailto && (
        <a className="open-mail" href={mailto}>{t(lang, 'form.open_mail')}</a>
      )}
    </form>
  )
}
