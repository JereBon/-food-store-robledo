import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/router/AppRouter'
import { Navigation } from '@/shared/components/Navigation'

export function App() {
  return (
    <AppProviders>
      <Navigation />
      <AppRouter />
    </AppProviders>
  )
}
