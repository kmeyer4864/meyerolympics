import { AdminLayout } from '../AdminLayout'
import { PuzzleList } from '../components/PuzzleList'

export function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Puzzle Studio</h1>
        </div>
        <PuzzleList />
      </div>
    </AdminLayout>
  )
}
