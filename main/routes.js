export default (components = {}) => [
  {
    path: '/',
    exact: true,
    component: components.PHome
  },
  {
    path: '/admin/create-game',
    exact: true,
    component: components.PCreateGame
  },
  {
    path: '/admin',
    exact: true,
    component: components.PAdmin
  },
  {
    path: '/admin/past-games',
    exact: true,
    component: components.PPastAdminGames
  },
  {
    path: '/games',
    exact: true,
    component: components.PGames
  },
  {
    path: '/past-games',
    exact: true,
    component: components.PPastGames
  },
  {
    path: '/games/:id',
    exact: true,
    component: components.PGame
  },
  {
    path: '/highscores',
    exact: true,
    component: components.PHighscores
  }
]
