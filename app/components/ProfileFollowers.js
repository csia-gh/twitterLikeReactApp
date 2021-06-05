import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import { useParams, Link } from 'react-router-dom'

import LoadingDotsIcon from './LoadingDotsIcon'

function ProfileFollowers() {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const { username } = useParams()

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/followers`)
        setPosts(response.data)
        setIsLoading(false)
      } catch (err) {
        console.log('There was a problem during fetching the posts')
        console.log(err)
      }
    }
    fetchPosts()
  }, [username])

  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${follower.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={follower.avatar} />{' '}
            {follower.username}
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollowers
