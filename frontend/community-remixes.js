import React, { useState } from 'react'
import styled from '@emotion/styled'
import { useDispatch } from 'react-redux'

import { useAsyncFunction } from './app-core'
import { useCurrentUser } from './current-user'
import { useResource, useChildResource, actions as resourceActions } from './resources'
import Button from './button'
import Input from './input'
import Box, { Flex } from './box'


const Loading = () => <div>Loading...</div>

const ProjectActions = ({ project }) => {
  const dispatch = useDispatch()
  const restartProject = () => {
    dispatch(resourceActions.restartedProject(project.id))
  }
  const deleteProject = () => {
    dispatch(resourceActions.deleted({ entity: 'projects', id: project.id }))
  }
  return (
    <div>
      <Box padding={1}>
        <Button type="secondary" size="small" onClick={restartProject}>Restart</Button>
      </Box>
      <Box padding={1}>
        <Button type="secondary" size="small" onClick={deleteProject}>Delete</Button>
      </Box>
    </div>
  ) 
}

// community remixes are from _either_ commmunity or community-staging
const communityIDs = [
  "02863ac1-a499-4a41-ac9c-41792950000f",
  "2bdfb3f8-05ef-4035-a06e-2043962a3a13"
]

async function getMyPRs (username) {
  const res = await fetch('https://api.github.com/repos/FogCreek/Glitch-Community/pulls')
  const prs = await res.json()
  const out = {}
  for (const pr of prs) {
    if (pr.user.login !== username) continue
    out[pr.head.ref] = pr
  }
  return out
}

const Header = styled.h1`
  font-weight: bold;
  font-size: 2rem;
`

const Table = styled.table`
  th {
    font-weight: 600;
    text-align: left;
  }
  th, td {
    padding: 0.25rem;
  }
  tr:nth-of-type(even) {
    background-color: #f9f9ff;
  }
`

const NewRemix = () => {
  const [description, setDescription] = useState('')
  const dispatch = useDispatch()
  const { community } = useResource('projects', 'community', 'domain') 
  const onClick = () => {
    resourceActions.remixedProject(community)
  }
  
  if (!community) return null
  return (
    <>
      <TextInput label="Description" value={description} onChange={setDescription} />
      <Button type="primary">Create ~community Remix</Button>
    </>
  )
}

const SwapButton = () => {
  const [swapStatus, setSwapStatus] = useState('ready')
  const dispatch = useDispatch()
  const confirmThenSwap = () => {
    if (!confirm("Are you sure you want to swap community & community-staging?")) return
    setSwapStatus('swapping...')
    dispatch({
      ...resourceActions.swappedProjects({ source: 'community-staging', target: 'community' }),
      onSuccess: () => { setSwapStatus('ok') },
      onError: () => { setSwapStatus('error') },
    })
  } 
  return (
    <Flex align="center">
      <Button type="dangerZone" onClick={confirmThenSwap}>Swap</Button>
      <Box padding={{ left: 1 }}>{swapStatus}</Box>
    </Flex>
  )
}

const CommunityRemixes = () => {
  const currentUser = useCurrentUser()
  const [githubUsername, setGithubUsername] = useState(currentUser.login)
  const { value: recentProjects } = useChildResource('users', currentUser.id, 'projects')
  const { value: pullRequestsByName } = useAsyncFunction(getMyPRs, githubUsername)
  if (!recentProjects || !pullRequestsByName) return <Loading />
  
  const communintyRemixes = recentProjects.filter(p => communityIDs.includes(p.baseId) && !communityIDs.includes(p.id))
  
  return (
    <section>
      <Box as="header" padding={{ top: 2, bottom: 4 }}>
        <Header>Community Remixes</Header>
        <Flex align="stretch">
          <Box padding={2}>
            <NewRemix />
          </Box>
          
          <Box padding={2} flex="1 0 auto" style={{ border: '2px solid red' }}>
            <SwapButton />
          </Box>
          
          <Box padding={2} flex="1 0 auto">
            <Input type="text" label="GitHub username" value={githubUsername} onChange={setGithubUsername} />
          </Box>
        </Flex>
      </Box>
      
      <Table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Description</th>
            <th>Open PR?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {communintyRemixes.map(project => {
            const pr = pullRequestsByName[project.domain]
            return(
              <tr key={project.id}>
                <td>{project.domain}</td>
                <td>{project.description}</td>
                <td>{pr && <a href={pr.url}>{pr.title}</a>}</td>
                <td><ProjectActions project={project} /></td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </section>
  )
}

export default CommunityRemixes
