import PHome from './pages/PHome'

import PAdmin from './pages/PAdmin'
import PCreateGame from './pages/PCreateGame'
import PPastAdminGames from './pages/PPastAdminGames'

import PGame from './pages/PGame'
import PGames from './pages/PGames'
import PPastGames from './pages/PPastGames'
import PHighscores from './pages/PHighscores'

import getRoutes from './routes'

export { default as Layout } from './Layout'
export const routes = getRoutes({ PHome, PCreateGame, PGames, PPastGames, PPastAdminGames, PHighscores, PGame, PAdmin })
