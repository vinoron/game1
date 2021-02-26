import React from 'react'
import { ImageBackground, TouchableOpacity, Linking } from 'react-native'
import { BASE_URL } from '@env'

import './index.styl'

const imageLogo = `${BASE_URL}/img/logo.jpeg`

const Logo = () => pug`
  TouchableOpacity.root(onPress=() => Linking.openURL('/'))
    ImageBackground.imageLogo(source={uri: imageLogo} imageStyleName='imageLogo')
`

export default Logo
