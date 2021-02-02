import React, { useCallback, useState } from 'react'
import { Div, Span, Tag, TextInput, Multiselect, Link, Button } from '@startupjs/ui'
import { withRouter } from 'react-router'
import { useValue, useDoc, useQuery, observer } from '@startupjs/react-sharedb'
import Title from 'components/Title'
import { GAMES_COLLECTION } from '../../const/default'
import './index.styl'

const CreateGameForm = ({ id, history }) => {
  const [game, $game] = useDoc(GAMES_COLLECTION, id)
  const [formData, $formData] = useValue(id ? { ...game } : {})
  const onSetFormValue = useCallback(
    (key) => (value) => {
      $formData.setEach({ [key]: value })
    }, [])

  const onSave = async () => {
    if (id) {
      $game.setEach(formData)
      history.push(`/admin/edit-${id}`)
    } else {
      await $game.create(formData)
      history.push('/admin')
    }
  }

  return pug`
    Div.root
      if formData.startedAt
        Title Game already started
        Div.status
        Div.footer
          Button.button(onClick=onFinish) #{'FINISH GAME'}
      else 
        Title Create new game
        TextInput.input(placeholder='Game Name' onChangeText=onSetFormValue('name') value=formData.name)
        TextInput.input(placeholder='Creator Name' onChangeText=onSetFormValue('creatorName') value=formData.creatorName)
        Div.footer
          Button.button(onClick=onSave) #{id ? 'UPDATE' : 'CREATE'}
  `
}
export default withRouter(observer(CreateGameForm))
