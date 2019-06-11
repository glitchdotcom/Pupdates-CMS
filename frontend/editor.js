import React, { cloneElement } from 'react'
import styled from '@emotion/styled'
import { useDispatch } from 'react-redux'
import { createReducer } from 'redux-starter-kit'

import Input from './input'
import TextArea from './textarea'
import Image from './image'
import Box, { Flex } from './box'
import exampleData from './example-data'

const sizes = ['inherit', '3rem', '2rem', '1.5rem', '1rem', '0.8rem']

const Text = styled.div`
  font-size: ${({ size }) => sizes[size || 0]};
  font-weight: ${({ weight }) => weight || 'inherit'};
`

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
    {items.map(item => (
      <Item key={getKey(item)}>{children(item)}</Item>
    ))}
  </Box>
)

const FlexListBase = Flex.withComponent(List)
const FlexItem = compose(<Box as="li" flex="1 0 auto" />)
const FlexList = compose(<FlexListBase itemComponent={FlexItem} />)

const Field = compose(<Box padding={{top: 2}}/>)

const connected = (Component) => ({ path, ...props }) => {
  const value = useSelector(state => get(state.formData, path))
  const dispatch = useDispatch()
  const 
}
  <Component {...props} value={get(value, path)} onChagne
)



const featureCalloutPreviewImages = {
  apps: 'https://cdn.glitch.com/fea4026e-9552-4533-a838-40d5a5b6b175%2Fdiscover-animation.svg?v=1560048767118',
  create: 'https://cdn.glitch.com/fea4026e-9552-4533-a838-40d5a5b6b175%2Fcreators-animation.svg?v=1560123089417',
  teams: 'https://cdn.glitch.com/fea4026e-9552-4533-a838-40d5a5b6b175%2Fteam-animation.svg?v=1560048765078',
}

const FeatureCallouts = ({ content }) =>  (
  <FlexList gap={1} items={content}>
    {item => (
      <Box>
        <Image src={featureCalloutPreviewImages[item.id]} alt=""/>
        <Field>
          <Input label="Title" value={item.label}/>
        </Field>
        <Field>
          <TextArea label="Description" value={item.description} />
        </Field>
        <Field>
          <Input label="Call to action" value={item.cta} />
        </Field>
        <Field>
          <Input label="Link url" value={item.href} />
        </Field>
      </Box>
    )}
  </FlexList>
)

const RelatedContent = ({ item }) => (
  <Box padding={{ top: 2, bottom: 1 }}>
    <Field>
      <Input label="Title" value={item.title} condensed />
    </Field>
    <Field>
      <Input label="Source" value={item.source} condensed />
    </Field>
    <Field>
      <Input label="Link url" value={item.href} condensed />
    </Field>
  </Box>
)

const UnifiedStories = ({ content }) => (
  <Box>
    <Field>
      <TextArea label="Headline" value={content.hed} />
    </Field>
    <Field>
      <Input label="Dek" value={content.dek} /> 
    </Field>
    <Field>
      <Flex gap={1}>
        <Box flex="0 1 50%">
          <Input label="Preview image" value={content.featuredImage} />
          <Field>
            <Input label="Description" value={content.featuredImageDescription} />
          </Field>
         <Field>
            <Input label="Link url" value={content.href} /> 
          </Field>
          <Field>
            <Input label="Link text" value={content.cta} /> 
          </Field>
        </Box>
        <Box flex="0 1 50%">
          <Image src={content.featuredImage} alt={content.featuredImageDescription} />
        </Box>
      </Flex>
    </Field>
    <Field>
      <TextArea label="Summary (markdown)" value={content.summary} minRows={6} />
    </Field>
   
    <SubTitle>Related Content</SubTitle>
    <List items={content.relatedContent}>
      {item => <RelatedContent item={item} />}
    </List>
  </Box>
)

const EmbedIFrame = styled.iframe`
  display: block;
  width: 100%;
  height: 400px;
  border: 0;
`

const EmbedPreview = ({ domain}) => (
  <EmbedIFrame
    title="embed"
    src={`https://glitch.com/embed/#!/embed/${domain}?path=README.md&previewSize=100`}
    alt={`${domain} on Glitch`}
    allow="geolocation; microphone; camera; midi; encrypted-media"
    allowvr="yes"
  />
)

const FeaturedEmbed = ({ content }) => (
  <Flex gap={2}>
    <Box flex="1 0 auto">
      <Field>
        <Input label="Title" value={content.title}/>
      </Field>
      <Field>
        <TextArea label="Description" value={content.description}/>
      </Field>
      <Field>
        <Input label="Link url" value={content.href}/>
      </Field>
      <Field>
        <Input label="App domain" value={content.domain}/>
      </Field>
    </Box>
    <Box flex="1 0 auto">
      <EmbedPreview domain={content.domain} />
    </Box>
  </Flex>
)

const AppsWeLove = ({ content }) => (
  <List items={content} getKey={(x) => x.domain}>
    {(item) => (
      <Flex gap={1}>
        <Box flex="0 1 50%">
          <Field>
            <Input label="Title" value={item.title} />
          </Field>
          <Field>
            <Input label="App domain" value={item.domain}/>
          </Field>
          <Field>
            <Input label="Preview image" value={item.img} />
          </Field>
        </Box>
        <Box flex="0 1 50%">
          <Image src={item.img} alt={item.title} />
        </Box>
      </Flex>
    )}
  </List>
)

const CuratedCollections = ({ content }) => (
  <FlexList items={content} gap={1}>
    {item => (
      <Box>
        <Field>
          <Input label="Title" value={item.title} />
        </Field>
        <Field>
          <TextArea label="Description" value={item.description}/>
        </Field>
        <Field>
          <Input label="Collection url" value={item.fullUrl} />
        </Field>
      </Box>
    )}
  </FlexList>
)

const BuildingImage = styled(Image)`
  height: 100px;
`

const BuildingOnGlitch = ({ content }) => (
  <FlexList items={content} gap={1}>
    {item => (
      <Box>
        <BuildingImage src={item.img} />
        <Field>
          <Input label="Title" value={item.title}/>
        </Field>
        <Field>
          <TextArea label="Description" value={item.description} />
        </Field>
        <Field>
          <Input label="Call to action" value={item.cta} />
        </Field>
        <Field>
          <Input label="Link url" value={item.href} />
        </Field>
      </Box>
    )}
  </FlexList>
)

const Editor = () => (
  <section>
    <Text as="h1" size={1}>
      Glitch Home Editor
    </Text>
    <Text as="p">All changes auto-save</Text>
    
    <SectionTitle>Feature Callouts</SectionTitle>
    <FeatureCallouts content={exampleData.featureCallouts} />
    
    <SectionTitle>Unified Stories</SectionTitle>
    <UnifiedStories content={exampleData.unifiedStories} />
    
    <SectionTitle>Featured Embed</SectionTitle>
    <FeaturedEmbed content={exampleData.featuredEmbed} />
    
    <SectionTitle>Apps We Love</SectionTitle>
    <AppsWeLove content={exampleData.appsWeLove} />
    
    <SectionTitle>Curated Collections</SectionTitle>
    <CuratedCollections content={exampleData.curatedCollections} />
    
    <SectionTitle>Start Building</SectionTitle>
    <BuildingOnGlitch content={exampleData.buildingOnGlitch} />
  </section>
)


export default Editor

