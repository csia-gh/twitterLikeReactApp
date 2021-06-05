import React, { useState, useReducer, useEffect, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { useImmerReducer } from 'use-immer'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import Axios from 'axios'
Axios.defaults.baseURL =
  process.env.BACKENDURL || 'https://backendforcompreactapp.herokuapp.com'

// Contexts
import StateContext from './StateContext'
import DispatchContext from './DispatchContext'

// Components
import LoadingDotsIcon from './components/LoadingDotsIcon'
import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Home from './components/Home'
import Footer from './components/Footer'
import About from './components/About'
import Terms from './components/Terms'
const CreatePost = React.lazy(() => import('./components/CreatePost'))
const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'))
import FlashMessages from './components/FlashMessages'
import Profile from './components/Profile'
import EditPost from './components/EditPost'
import NotFound from './components/NotFound'
const Search = React.lazy(() => import('./components/Search'))
const Chat = React.lazy(() => import('./components/Chat'))

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem('complexreactappToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexreactappToken'),
      username: localStorage.getItem('complexreactappUsername'),
      avatar: localStorage.getItem('complexreactappAvatar'),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true
        draft.user = action.data
        return
      case 'logout':
        draft.loggedIn = false
        return
      case 'flashMessage':
        draft.flashMessages.push(action.value)
        return
      case 'openSearch':
        draft.isSearchOpen = true
        return
      case 'closeSearch':
        draft.isSearchOpen = false
        return
      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen
        return
      case 'closeChat':
        draft.isChatOpen = false
        return
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++
        return
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexreactappToken', state.user.token)
      localStorage.setItem('complexreactappUsername', state.user.username)
      localStorage.setItem('complexreactappAvatar', state.user.avatar)
    } else {
      localStorage.removeItem('complexreactappToken')
      localStorage.removeItem('complexreactappUsername')
      localStorage.removeItem('complexreactappAvatar')
    }
  }, [state.loggedIn])

  // Check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      const request = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post(
            '/checkToken',
            {
              token: state.user.token,
            },
            {
              cancelToken: request.token,
            }
          )
          if (!response.data) {
            dispatch({ type: 'logout' })
            dispatch({
              type: 'flashMessage',
              value: 'Your session has expired. Please log in again.',
            })
          }
        } catch (error) {
          console.log('There was a problem or the request was cancelled.')
          console.log(error)
          if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
          }
        }
      }
      fetchResults()

      return () => request.cancel()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />

          <Header />

          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>

              <Route path="/profile/:username">
                <Profile />
              </Route>

              <Route path="/post/:id/edit">
                <EditPost />
              </Route>

              <Route path="/create-post">
                <CreatePost />
              </Route>

              <Route path="/post/:id">
                <ViewSinglePost />
              </Route>

              <Route path="/about-us">
                <About />
              </Route>

              <Route path="/terms">
                <Terms />
              </Route>

              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>

          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>

          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>

          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector('#app'))

if (module.hot) {
  module.hot.accept()
}
