import React, { useEffect } from 'react'
import { ImageBackground } from 'react-native'
import { withRouter } from 'react-router'
import { useSession, observer } from 'startupjs'
import { Layout, Div, DrawerSidebar, Row, Button } from '@startupjs/ui'
import { BASE_URL } from '@env'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import LeftMenu from 'components/LeftMenu'
import { SIDEBAR_KEY } from '../../const/default'

import './index.styl'

const MainLayout = ({ match, children }) => {
  const [, $open] = useSession(SIDEBAR_KEY)
  const onPress = () => $open.set(true)
  const pic = `${BASE_URL}/img/bg01.jpg`

  const getMenu = () => pug`
    LeftMenu
  `
  useEffect(() => {
    $open.set(false)
  }, [match.params])

  return pug`
    Layout.root
      ImageBackground.bg(
        source={uri: pic}
        imageStyleName='bgImage'
        resizeMode="cover"
      )
        DrawerSidebar(
          $open=$open
          width=240
          defaultOpen=false
          renderContent=getMenu
        )
          Div.content
            Row.sidebarLine
              Button.bars(onPress=onPress variant='flat' icon=faBars)
            Row=children
  `
}

export default withRouter(observer(MainLayout))
