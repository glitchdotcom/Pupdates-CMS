import React, { cloneElement, useEffect } from 'react'
import styled from '@emotion/styled'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { createSlice } from 'redux-starter-kit'

import { useCurrentUser } from './current-user'
import BaseInput from './input'
import BaseTextArea from './textarea'
import Image from './image'
import Box, { Flex } from './box'
import Text from './text'

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
    }
  },
})

const handlers = {
  [actions.updatedField]: debounce(async (store) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    const state = store.getState().homeData.data
    console.log('saving', state, persistentToken)
  }, 3000)
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

          
const SectionTitle = compose(
  <Box padding={{ top: 4, bottom: 1 }} />,
  <Text as="h1" size={2} weight="bold" />
)

const SubTitle = compose(
  <Box padding={{ y: 2 }}/>,
  <Text as="h2" size={3} weight="bold"/>
)

const List = ({ items, children, getKey = (x) => x.id, itemComponent: Item = 'li', ...props }) => (
  <Box as="ul" {...props}>
    {items.map((item, index) => (
      <Item key={getKey(item)}>{children(item, index)}</Item>
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

const featureCalloutPreviewImages = {
  apps: 'https://cdn.glitch.com/fea4026e-9552-4533-a838-40d5a5b6b175%2Fdiscover-animation.svg?v=1560048767118',
  create: 'https://cdn.glitch.com/fea4026e-9552-4533-a838-40d5a5b6b175%2Fcreators-animation.svg?v=1560123089417',
  teams: 'https://cdn.glitch.com/fea4026e-9552-4533-a838-40d5a5b6b175%2Fteam-animation.svg?v=1560048765078',
}

const FeatureCallouts = () => {
  const items = usePath(['featureCallouts'])
  return (
    <FlexList gap={1} items={items}>
      {({ id }, i) => (
        <Box>
          <Image src={featureCalloutPreviewImages[id]} alt=""/>
          <Field>
            <Input label="Title" path={['featureCallouts', i, 'label']}/>
          </Field>
          <Field>
            <TextArea label="Description" path={['featureCallouts', i, 'description']}/>
          </Field>
          <Field>
            <Input label="Call to action" path={['featureCallouts', i, 'cta']}/>
          </Field>
          <Field>
            <Input label="Link url" path={['featureCallouts', i, 'href']}/>
          </Field>
        </Box>
      )}
    </FlexList>
  )
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
      <TextArea label="Headline" path={['unifiedStories', 'hed']} />
    </Field>
    <Field>
      <Input label="Dek" path={['unifiedStories', 'dek']} /> 
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

const EmbedIFrame = styled.iframe`
  display: block;
  width: 100%;
  height: 400px;
  border: 0;
`

const EmbedPreview = ({ domain }) => (
  <EmbedIFrame
    title="embed"
    src={`https://glitch.com/embed/#!/embed/${domain}?path=README.md&previewSize=100`}
    alt={`${domain} on Glitch`}
    allow="geolocation; microphone; camera; midi; encrypted-media"
    allowvr="yes"
  />
)

const FeaturedEmbed = () => (
  <Flex gap={2}>
    <Box flex="1 0 auto">
      <Field>
        <Input label="Title" path={['featuredEmbed', 'title']}/>
      </Field>
      <Field>
        <TextArea label="Description" path={['featuredEmbed', 'description']}/>
      </Field>
      <Field>
        <Input label="Link url" path={['featuredEmbed', 'href']}/>
      </Field>
      <Field>
        <Input label="App domain" path={['featuredEmbed', 'domain']}/>
      </Field>
    </Box>
    <Box flex="1 0 auto">
      <EmbedPreview domain={usePath(['featuredEmbed', 'domain'])} />
    </Box>
  </Flex>
)

const AppsWeLove = () => (
  <List items={usePath(['appsWeLove'])} getKey={(x) => x.domain}>
    {(item, i) => (
      <Flex gap={1}>
        <Box flex="0 1 50%">
          <Field>
            <Input label="Title" path={['appsWeLove', i, 'title']}/>
          </Field>
          <Field>
            <Input label="App domain" path={['appsWeLove', i, 'domain']}/>
          </Field>
          <Field>
            <Input label="Preview image" path={['appsWeLove', i, 'img']}/>
          </Field>
        </Box>
        <Box flex="0 1 50%">
          <Image src={item.img} alt={item.title} />
        </Box>
      </Flex>
    )}
  </List>
)

const CuratedCollections = () => (
  <FlexList items={usePath(['curatedCollections'])} gap={1} getKey={item => item.fullUrl}>
    {(item, i) => (
      <Box>
        <Field>
          <Input label="Title" path={['curatedCollections', i, 'title']}/>
        </Field>
        <Field>
          <TextArea label="Description" path={['curatedCollections', i, 'description']}/>
        </Field>
        <Field>
          <Input label="Collection url" path={['curatedCollections', i, 'fullUrl']}/>
        </Field>
      </Box>
    )}
  </FlexList>
)

const BuildingImage = styled(Image)`
  height: 100px;
`

const BuildingOnGlitch = () => (
  <FlexList items={usePath(['buildingOnGlitch'])} gap={1} getKey={item => item.href}>
    {(item, i) => (
      <Box>
        <BuildingImage src={item.img} />
        <Field>
          <Input label="Title" path={['buildingOnGlitch', i, 'title']}/>
        </Field>
        <Field>
          <TextArea label="Description" path={['buildingOnGlitch', i, 'description']}/>
        </Field>
        <Field>
          <Input label="Call to action" path={['buildingOnGlitch', i, 'cta']}/>
        </Field>
        <Field>
          <Input label="Link url" path={['buildingOnGlitch', i, 'href']}/>
        </Field>
      </Box>
    )}
  </FlexList>
)

const Loading = () => <div>Loading...</div>;

const Editor = () => {
  const dispatch = useDispatch()
  const homeDataStatus = useSelector(state => state.homeData.status)
  useEffect(() => {
    loadInitialData().then(data => dispatch(actions.loadedData(data)))
  }, [])
  
  if (homeDataStatus === 'loading') return <Loading />
  
  return (
    <Box as="section" padding={{bottom: 4}}>
      <Text as="h1" size={1}>
        Glitch Home Editor
      </Text>
      <Text as="p">All changes auto-save</Text>

      <SectionTitle>Feature Callouts</SectionTitle>
      <FeatureCallouts />

      <SectionTitle>Unified Stories</SectionTitle>
      <UnifiedStories />

      <SectionTitle>Featured Embed</SectionTitle>
      <FeaturedEmbed />

      <SectionTitle>Apps We Love</SectionTitle>
      <AppsWeLove />

      <SectionTitle>Curated Collections</SectionTitle>
      <CuratedCollections />

      <SectionTitle>Start Building</SectionTitle>
      <BuildingOnGlitch />
    </Box>
  )
}

export default Editor

