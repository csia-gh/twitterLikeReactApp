import React, { useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useImmer } from 'use-immer'
import Axios from 'axios'

import StateContext from '../StateContext'

import Page from './Page'
import LoadingDotsIcon from './LoadingDotsIcon'
import Post from './Post'

function Home() {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    isLoading: true,
    feed: [],
  })

  useEffect(() => {
    const request = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.post(
          '/getHomeFeed',
          {
            token: appState.user.token,
          },
          {
            cancelToken: request.token,
          }
        )
        setState(draft => {
          draft.feed = response.data
          draft.isLoading = false
        })
      } catch (err) {
        console.log('There was a problem during fetching feed')
        console.log(err)
      }
    }
    fetchData()

    return () => request.cancel()
  }, [])

  if (state.isLoading) {
    return <LoadingDotsIcon />
  }

  return (
    <Page title="Your Feed">
      {state.feed.length > 0 && (
        <>
          <h2 className="text-center mb-4">The Latest From Those You Follow</h2>
          <div className="list-group mb-4">
            {state.feed.map(post => {
              return <Post post={post} key={post._id} />
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If
            you don&rsquo;t have any friends to follow that&rsquo;s okay; you
            can use the &ldquo;Search&rdquo; feature in the top menu bar to find
            content written by people with similar interests and then follow
            them.
          </p>
        </>
      )}
    </Page>
  )
}

export default Home