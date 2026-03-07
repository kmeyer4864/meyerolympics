import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

export default function Home() {
  const { user, profile, signOut } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="font-display text-xl font-bold text-gold">
          Competition Olympics
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              {profile?.display_name}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">🏅</div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
          Competition
          <span className="text-gradient-gold"> Olympics</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-md mb-12">
          Challenge your friends to a series of mini-games. Win events. Earn medals.
          Become the champion.
        </p>

        {user ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/create"
              className="px-8 py-4 bg-gold text-navy-950 font-bold text-lg rounded-lg hover:bg-gold-400 transition-colors"
            >
              Create Olympics
            </Link>
            <Link
              to="/join"
              className="px-8 py-4 bg-navy-800 text-white font-bold text-lg rounded-lg border border-navy-600 hover:border-gold transition-colors"
            >
              Join Olympics
            </Link>
          </div>
        ) : (
          <Link
            to="/auth"
            className="px-8 py-4 bg-gold text-navy-950 font-bold text-lg rounded-lg hover:bg-gold-400 transition-colors"
          >
            Get Started
          </Link>
        )}

        {/* Event Preview */}
        <div className="mt-16 max-w-2xl w-full">
          <h2 className="font-display text-lg text-gray-500 mb-6">
            Available Events
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: '9️⃣', name: 'Sudoku' },
              { icon: '🔗', name: 'Flashback' },
              { icon: '🌍', name: 'Geography' },
              { icon: '🃏', name: "Hold'em" },
              { icon: '♠️', name: 'Cribbage' },
            ].map((event) => (
              <div
                key={event.name}
                className="flex items-center gap-2 px-4 py-2 bg-navy-800 rounded-lg"
              >
                <span className="text-xl">{event.icon}</span>
                <span className="text-sm text-gray-300">{event.name}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-gray-600 text-sm">
        Built for competitive spirits
      </footer>
    </div>
  )
}
