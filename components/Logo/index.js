import React from 'react'
import { ImageBackground, Linking } from 'react-native'
import { Div } from '@startupjs/ui'
import { BASE_URL } from '@env'

import './index.styl'

const imageLogo = `${BASE_URL}/img/logo.jpeg`

const Logo = () => pug`
  Div.root(onPress=() => Linking.openURL('/'))
    ImageBackground.imageLogo(source={uri: imageLogo} imageStyleName='imageLogo')
`

export default Logo
