import React, { cloneElement, useState, useEffect } from 'react'
import styled from '@emotion/styled'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { createSlice } from 'redux-starter-kit'

import { useCurrentUser } from './current-user'
import BaseInput from './input'
import BaseTextArea from './textarea'
import Image from './image'
import Box, { Flex } from './box'
import Button from './button'
import Text from './text'
import { useUploader } from './assets'

const APP_BASE = `https://glitch.com`

const debounce = (fn, timeout) => {
  let handle
  return (...args) => {
    clearTimeout(handle)
    handle = setTimeout(() => fn(...args), timeout)
  }
}

const { slice, reducer, actions } = createSlice({
  slice: 'homeData',
  initialState: {
    status: 'loading',
    data: null,
  },
  reducers: {
    loadedData: (state, { payload }) => ({
      status: 'ready',
      data: payload,
    }),
    updatedField: (state, { payload: { path, value } }) => {
      const most = path.slice(0, -1)
      const last = path[path.length - 1]
      get(state.data, most)[last] = value
    },
    reset: (state) => ({
      status: 'loading',
      data: null,
    }),
  },
})

const handlers = {
  [actions.updatedField]: debounce(async (store) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    const state = store.getState().homeData.data
    await axios.post('/pupdate.json', state, { headers: { Authorization: persistentToken } })
    console.log('updated ok')
  }, 3000),
  [actions.reset]: async (store) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    const { data } = await axios.get(`${APP_BASE}/api/home`)
    await axios.post('/pupdate.json', data, { headers: { Authorization: persistentToken } })
    store.dispatch(actions.loadedData(data))
  },
}

const usePath = (path) => {
  return useSelector(state => get(state.homeData.data, path))
}

const loadInitialData = async () => {
  const { data } = await axios.get('/pupdate.json')
  return data
}

export const editorSlice = { slice, reducer, actions, handlers }

const compose = (...baseElements) => baseElements
  .map(element => (props) => cloneElement(element, props))
  .reduce((Parent, Child) => ({ children, ...props }) => <Parent {...props}><Child>{children}</Child></Parent>)
       
const SectionTitle = compose(
  <Box as="summary" padding={{ top: 4, bottom: 1 }} />,
  <Text as="h1" size={2} weight="bold" />
)

const SubTitle = compose(
  <Box padding={{ y: 2 }}/>,
  <Text as="h2" size={3} weight="bold"/>
)

const List = ({ items, children, itemComponent: Item = 'li', ...props }) => (
  <Box as="ul" {...props}>
    {items.map((item, index) => (
      <Item key={index}>{children(item, index)}</Item>
    ))}
  </Box>
)

const FlexListBase = Flex.withComponent(List)
const FlexItem = compose(<Box as="li" flex="1 0 auto" />)
const FlexList = compose(<FlexListBase itemComponent={FlexItem} />)

const Field = compose(<Box padding={{top: 2}}/>)

const get = (object, path) => path.reduce((target, key) => target[key], object)


const connected = (Component) => ({ path, ...props }) => {
  const value = usePath(path)
  const dispatch = useDispatch()
  const onChange = (value) => dispatch(actions.updatedField({ value, path }))
  return <Component {...props} value={value} onChange={onChange} />
}

const Input = connected(BaseInput)
const TextArea = connected(BaseTextArea)

const ImageInput = ({ path, label }) => {
  const src = usePath(path)
  const upload = useUploader()
  const dispatch = useDispatch()
  const uploadAndSave = () => upload().then(url => {
    dispatch(actions.updatedField({ value: url, path }))
  })
  return (
    <>
      <Input label={label} path={path}/>
      <Button onClick={uploadAndSave}>Upload</Button>
      <Image src={usePath(path)} alt="" />
    </>
  )
}

const OK = styled.span`
  display: inline-block;
  padding: 2px 4px 0;
  color: white;
  background-color: #0c0;
  font-weight: bold;
  font-size: 0.8em;
`

const ERROR = styled(OK)`
  background-color: #c00;
`

const ValidLink = ({ href }) => {
  const isValid = href.startsWith('/') || href.startsWith('http')
  return isValid ? <OK>OK</OK> : <ERROR>ERROR</ERROR>
}

const featureCalloutPreviewImages = {
  apps: 'https://cdn.glitch.com/fea4026e-9552-4533-a838-40d5a5b6b175%2Fdiscover-animation.svg?v=1560048767118',
  create: 'https://cdn.glitch.com/fea4026e-9552-4533-a838-40d5a5b6b175%2Fcreators-animation.svg?v=1560123089417',
  teams: 'https://cdn.glitch.com/fea4026e-9552-4533-a838-40d5a5b6b175%2Fteam-animation.svg?v=1560048765078',
}

const FeatureCallouts = () => {
  const items = usePath(['pupdates'])
  return (
    <FlexList gap={1} items={items}>
      {({ id }, i) => (
        <Box>
          <Image src={featureCalloutPreviewImages[id]} alt=""/>
          <Field>
            <Input label="Title" path={['pupdates', i, 'title']}/>
          </Field>
          <Field>
            <TextArea label="Description" path={['pupdates', i, 'summary']}/>
          </Field>
          <Field>
            <Input label="Call to action" path={['pupdates', i, 'image']}/>
          </Field>
        </Box>
      )}
    </FlexList>
  )
}

const Loading = () => <div>Loading...</div>

const Editor = () => {
  const dispatch = useDispatch()
  const homeDataStatus = useSelector(state => state.homeData.status)
  useEffect(() => {
    loadInitialData().then(data => dispatch(actions.loadedData(data)))
  }, [])
  
  const confirmThenReset = () => {
    if (confirm("Are you sure you want to reset? All your changes will be lost.")) {
      dispatch(actions.reset())
    }
  }
  
  if (homeDataStatus === 'loading') return <Loading />
  
  return (
    <Box as="section" padding={{bottom: 4}}>
      <Text as="h1" size={1}>
        Glitch Pupdate Editor
      </Text>
      <Text as="p">
        All changes auto-save for the preview. To confirm and publish, 
        visit <a href={`${APP_BASE}/index/preview`}>glitch.com/index/preview</a>.
      </Text>
      <Box padding={{ top: 2 }}>
        <Button onClick={confirmThenReset} type="dangerZone">💣 Reset all changes</Button>
      </Box>      
      <SectionTitle>Learn More</SectionTitle>
      <FeatureCallouts />

    </Box>
  )
}

export default Editor

