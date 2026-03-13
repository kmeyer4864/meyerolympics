import { useState } from 'react'

interface ShareOlympicsProps {
  inviteCode: string
  title?: string
  message?: string
  variant?: 'default' | 'compact'
  className?: string
}

export default function ShareOlympics({
  inviteCode,
  title = 'Challenge a Friend',
  message,
  variant = 'default',
  className = '',
}: ShareOlympicsProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const shareUrl = `${window.location.origin}/join/${inviteCode}`
  const shareMessage = message ?? `I challenge you to MeyerOlympics! Join with code: ${inviteCode}`

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2000)
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(inviteCode)
    setCopiedCode(true)
    showToast('Code copied to clipboard!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    showToast('Link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: 'MeyerOlympics Challenge',
        text: shareMessage,
        url: shareUrl,
      })
    } catch {
      // User cancelled or share failed, fall back to copy link
      copyLink()
    }
  }

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator

  // Toast notification component
  const Toast = () => (
    toastMessage ? (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <div className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg">
          <CheckIcon className="w-5 h-5" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      </div>
    ) : null
  )

  if (variant === 'compact') {
    return (
      <>
        <div className={`bg-navy-800 rounded-xl p-4 ${className}`}>
          <p className="text-gray-400 text-sm mb-2 text-center">{title}</p>
          <div className="flex items-center justify-center gap-2">
            <code className="text-2xl font-mono font-bold text-gold tracking-widest">
              {inviteCode}
            </code>
            <button
              onClick={copyCode}
              className="p-2 bg-navy-700 rounded-lg hover:bg-navy-600 transition-colors"
              title="Copy code"
            >
              {copiedCode ? (
                <CheckIcon className="w-5 h-5 text-green-400" />
              ) : (
                <CopyIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={copyLink}
              className="p-2 bg-navy-700 rounded-lg hover:bg-navy-600 transition-colors"
              title="Copy link"
            >
              {copiedLink ? (
                <CheckIcon className="w-5 h-5 text-green-400" />
              ) : (
                <LinkIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {canShare && (
              <button
                onClick={nativeShare}
                className="p-2 bg-navy-700 rounded-lg hover:bg-navy-600 transition-colors"
                title="Share"
              >
                <ShareIcon className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        <Toast />
      </>
    )
  }

  return (
    <>
      <div className={`bg-navy-900 rounded-xl p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4 text-center">{title}</h3>

        {/* Invite Code Display */}
        <div className="bg-navy-800 rounded-lg p-4 mb-4">
          <p className="text-gray-400 text-sm mb-2 text-center">Invite Code</p>
          <code className="block text-4xl font-mono font-bold text-gold tracking-widest text-center">
            {inviteCode}
          </code>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={copyCode}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-navy-700 text-white font-medium rounded-lg hover:bg-navy-600 transition-colors"
          >
            {copiedCode ? (
              <>
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-5 h-5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-navy-700 text-white font-medium rounded-lg hover:bg-navy-600 transition-colors"
          >
            {copiedLink ? (
              <>
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-5 h-5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Native Share Button (if supported) */}
        {canShare && (
          <button
            onClick={nativeShare}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gold text-navy-950 font-bold rounded-lg hover:bg-gold-400 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
            <span>Share Challenge</span>
          </button>
        )}

        <p className="text-sm text-gray-500 mt-4 text-center">
          Your opponent will play the exact same games for fair competition.
        </p>
      </div>
      <Toast />
    </>
  )
}

// Icon Components
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  )
}
