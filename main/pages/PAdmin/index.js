import React from 'react'
import { withRouter } from 'react-router'
import { Div, Button } from '@startupjs/ui'

import PageSlogan from 'components/PageSlogan'
import GameList from 'components/GameList'

import './index.styl'

const PAdmin = ({ history }) => {
  const goCreate = () => {
    history.push('/admin/create-game')
  }

  const goPast = () => {
    history.push('/admin/past-games')
  }

  return pug`
    Div.root
      PageSlogan(text='ADMIN')
      Div
        Button.createBtn(color='primary' variant='flat' onClick=goCreate) #{'CREATE GAME'}
        GameList(mode='admin')
        Button.pastBtn(color='primary' variant='flat' onClick=goPast) #{'PAST GAMES'}
  `
}

export default withRouter(PAdmin)
