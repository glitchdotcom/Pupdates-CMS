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

// const weights = [100]
// const sizes = ['0.5rem', '0.8rem', '1rem', '1.5rem', '2rem', '3rem', '4rem'];

// const Text = styled.div`
//   font-weight: ${props => weights[props.weight] || 'normal'};
//   font-size: ${props => sizes[props.size] || 'inherit'};
// `

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
  const { value: community } = useResource('projects', 'community', 'domain')
  const { value: performanceBoost } = useResource('teams', 'Performance-Boost', 'url')
  const onClick = () => {
    dispatch({
      ...resourceActions.remixedProjectAsTeam({ project: community.id, team: performanceBoost.id, description }),
      onSuccess: () => {
        setDescription('')
      }
    })
  }
  return (
    <>
      <Input label="Remix description" value={description} onChange={setDescription} />
      <Box padding={{ top: 2 }}>
        <Button type="primary" onClick={onClick}>Create Remix on Performance Boost</Button>
      </Box>
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
      onError: () => { setSwapStatus('maybe error? check if it worked') },
    })
  } 
  return (
    <Flex align="center" gap={1}>
      <Button type="dangerZone" onClick={confirmThenSwap}>Swap</Button>
      <div>{swapStatus}</div>
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
        <Flex align="stretch" gap={2}>
          <Box flex="1 1 auto">
            <NewRemix />
          </Box>
          
          <Box padding={2} flex="1 1 auto" style={{ border: '2px solid red' }}>
            <SwapButton />
          </Box>
          
          <Box flex="1 1 auto">
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
                <td>
                  <a href={`https://glitch.com/edit/#!/${project.domain}`}>{project.domain}</a>
                </td>
                <td>{project.description}</td>
                <td>{pr && <a href={pr.html_url}>{pr.title}</a>}</td>
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

