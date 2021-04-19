import React from 'react'
import { Div, Menu, Link } from '@startupjs/ui'
import Logo from 'components/Logo'

import './index.styl'

const { Item: MenuItem } = Menu
const items = [
  { title: 'HOME', url: '/' },
  { title: 'GAMES', url: '/games' },
  { title: 'HIGHSCORES', url: '/highscores' },
  { title: 'ADMIN', url: '/admin' }
]

const LeftMenu = () => {
  return pug`
    Div.root
      Div.logo
        Logo
      Menu.menu
        each item, index in items
          MenuItem.mi(key=index)
            Link.m(to=item.url) #{item.title}

    `
}
export default LeftMenu
