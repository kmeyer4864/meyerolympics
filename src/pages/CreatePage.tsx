import { Link } from 'react-router-dom'
import CreateOlympicsForm from '@/components/lobby/CreateOlympicsForm'

export default function CreatePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
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

        <CreateOlympicsForm />
      </div>
    </div>
  )
}
