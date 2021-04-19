import React, { useCallback, useState } from 'react'
import { withRouter } from 'react-router'
import { useValue, useDoc, useModel, observer } from 'startupjs'
import { Div, TextInput, Button, Row } from '@startupjs/ui'
import Title from 'components/Title'
import { GAMES_COLLECTION } from '../../const/default'
import './index.styl'

const CreateGameForm = ({ id, history }) => {
  const $games = useModel(GAMES_COLLECTION)
  const [game = {}, $game] = useDoc(GAMES_COLLECTION, id)
  const [formData, $formData] = useValue({ ...game })
  const onSetFormValue = useCallback(
    (key) => (value) => {
      $formData.set(key, value)
    }, [])

  const onSave = async () => {
    if (id) {
      $game.setEach(formData)
      history.push(`/admin/edit-${id}`)
    } else {
      await $games.create(formData)
      history.push('/admin')
    }
  }

  return pug`
    Div.root
      if formData.startedAt
        Title Game already started
        Div.status
        Row.footer
          Button.button(onClick=onFinish) #{'FINISH GAME'}
      else 
        Title Create new game
        TextInput.input(placeholder='Game Name' onChangeText=onSetFormValue('name') value=formData.name)
        TextInput.input(placeholder='Creator Name' onChangeText=onSetFormValue('creatorName') value=formData.creatorName)
        Row.footer
          Button.button(onClick=onSave) #{id ? 'UPDATE' : 'CREATE'}
  `
}
export default withRouter(observer(CreateGameForm))
