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
    await axios.post('/home.json', state, { headers: { Authorization: persistentToken } })
    console.log('updated ok')
  }, 3000),
  [actions.reset]: async (store) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    const { data } = await axios.get(`${APP_BASE}/api/home`)
    await axios.post('/home.json', data, { headers: { Authorization: persistentToken } })
    store.dispatch(actions.loadedData(data))
  },
}

const usePath = (path) => {
  return useSelector(state => get(state.homeData.data, path))
}

const loadInitialData = async () => {
  const { data } = await axios.get('/home.json')
  return data
}

export const editorSlice = { slice, reducer, actions, handlers }

const compose = (...baseElements) => baseElements
  .map(element => (props) => cloneElement(element, props))
  .reduce((Parent, Child) => ({ children, ...props }) => <Parent {...props}><Child>{children}</Child></Parent>)

const Section = 'details'          
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

const RelatedContent = ({ path }) => (
  <Box padding={{ top: 2, bottom: 1 }}>
    <Field>
      <Input label="Title" path={[...path, 'title']} condensed />
    </Field>
    <Field>
      <Input label="Source" path={[...path, 'source']} condensed />
    </Field>
    <Field>
      <Input label="Link url" path={[...path, 'href']} condensed />
    </Field>
  </Box>
)

const UnifiedStories = () => (
  <Box>
    <Field>
      <TextArea label="Headline" path={['unifiedStories', 'hed']} minRows={2} />
    </Field>
    <Field>
      <Input label="Subject" path={['unifiedStories', 'dek']} /> 
    </Field>
    <Field>
      <Flex gap={1}>
        <Box flex="0 1 50%">
          <Input label="Preview image" path={['unifiedStories', 'featuredImage']} />
          <Field>
            <Input label="Description" path={['unifiedStories', 'featuredImageDescription']} />
          </Field>
         <Field>
            <Input label="Link url" path={['unifiedStories', 'href']} /> 
          </Field>
          <Field>
            <Input label="Link text" path={['unifiedStories', 'cta']} /> 
          </Field>
        </Box>
        <Box flex="0 1 50%">
          <Image src={usePath(['unifiedStories', 'featuredImage'])} />
        </Box>
      </Flex>
    </Field>
    <Field>
      <TextArea label="Summary (markdown)" path={['unifiedStories', 'summary']} minRows={6} />
    </Field>
   
    <SubTitle>Related Content</SubTitle>
    <List items={usePath(['unifiedStories', 'relatedContent'])}>
      {(item, i) => <RelatedContent path={['unifiedStories', 'relatedContent', i]} />}
    </List>
  </Box>
)


  




const loading = { status: 'loading' }
const CollectionPreview = ({ fullUrl }) => {
  const [response, setResponse] = useState(loading)
  useEffect(() => {
    setResponse(loading)
    let isCurrentRequest = true
    axios.get(`https://api.glitch.com/v1/collections/by/fullUrl/projects?fullUrl=${fullUrl}`)
      .then((response) => {
        if (!isCurrentRequest) return
        setResponse({ status: 'ready', value: response.data.items })
      })
      .catch((response) => {
        if (!isCurrentRequest) return
        setResponse({ status: 'error', error: response }) 
      })
    return () => {
      isCurrentRequest = false
    }
  }, [fullUrl])

  if (response.status === 'loading') return 'Loading...'
  if (response.status === 'error') return <ERROR>ERROR</ERROR>
  return (
    <List items={response.value.slice(0, 3)}>
      {(item) => (
        <Box padding={2}>
          <Text as="h3" weight="bold">{item.domain}</Text>
          <Text as="p">{item.description}</Text>
        </Box>
      )}
    </List>
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
      <Section open>      
        <SectionTitle>Unified Stories</SectionTitle>
        <UnifiedStories />
      </Section>
    </Box>
  )
}

export default Editor

