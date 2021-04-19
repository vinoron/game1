import React from 'react'
import { withRouter } from 'react-router'
import { observer, useDoc, useModel, useSession, useValue } from 'startupjs'
import { Div, Button, TextInput } from '@startupjs/ui'
import PageSlogan from 'components/PageSlogan'
import GameList from 'components/GameList'
import Title from 'components/Title'
import { PLAYERS_COLLECTION } from '../../../const/default'
import './index.styl'

const PGames = ({ history }) => {
  const [sessionUserId] = useSession('userId')
  const $players = useModel(PLAYERS_COLLECTION)
  const [player] = useDoc(PLAYERS_COLLECTION, sessionUserId)
  const [userName, $userName] = useValue('')

  const onSetNewUser = () => {
    const name = userName.trim()
    if (name) {
      $players.addUser({
        name
      }, sessionUserId)
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
