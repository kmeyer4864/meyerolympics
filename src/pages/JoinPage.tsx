import { Link } from 'react-router-dom'
import JoinOlympicsForm from '@/components/lobby/JoinOlympicsForm'

export default function JoinPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        <JoinOlympicsForm />
      </div>
    </div>
  )
}
