import React from 'react'
import { TouchableOpacity, Linking } from 'react-native'
import { Div, Menu, Link, Icon, Button } from '@startupjs/ui'
import Logo from 'components/Logo'
import { SIDEBAR_KEY } from '../../const/default'

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
