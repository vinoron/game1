import React, { useEffect, useState, useRef } from 'react'
import { withRouter } from 'react-router'
import { Div, Button, TextInput } from '@startupjs/ui'
import { observer, useDoc, useLocal, useValue } from '@startupjs/react-sharedb'
import PageSlogan from 'components/PageSlogan'
import GameList from 'components/GameList'
import Title from 'components/Title'
import { PLAYERS_COLLECTION } from '../../../const/default'
import './index.styl'

const PGames = ({ history }) => {
  const [userId] = useLocal('_session.userId')
  const [player, $player] = useDoc(PLAYERS_COLLECTION, userId)
  const [userName, $userName] = useValue('')

  const onSetNewUser = () => {
    const name = userName.trim()
    if (name) {
      $player.create({
        id: userId,
        name
      })
    }
  }

  const goPast = () => {
    history.push('/past-games')
  }

  return pug`
    Div.root
      if (!player || !player.id)
        Div.newUser
          Title #{'Welcome!'}
          TextInput.input(placeholder='Enter your name' value=userName onChangeText=(v => $userName.set(v)))
          Button.button(onClick=onSetNewUser) #{'Apply'}
      else
        PageSlogan(text=('Welcome, '+player.name))
        GameList(mode="user")
        Button.pastBtn(color='primary' variant='flat' onClick=goPast) #{'PAST GAMES'}
  `
}
export default withRouter(observer(PGames))
