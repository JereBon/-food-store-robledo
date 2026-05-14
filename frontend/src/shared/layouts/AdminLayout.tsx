import { FC, PropsWithChildren } from 'react'

const AdminLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="flex-1 p-4 lg:p-6">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
