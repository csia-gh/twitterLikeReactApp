import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import { useParams, Link } from 'react-router-dom'

import LoadingDotsIcon from './LoadingDotsIcon'
import Post from './Post'

function ProfilePosts() {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const { username } = useParams()

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`)
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
      {posts.map(post => {
        return <Post noAuthor={true} post={post} key={post._id} />
      })}
    </div>
  )
}

export default ProfilePosts
