import React, { useState, useReducer } from 'react'
import styled from '@emotion/styled'
import { useDispatch } from 'react-redux'
import { createReducer } from 'redux-starter-kit'

import { useAsyncFunction } from './app-core'
import { useCurrentUser } from './current-user'
import { useResource, useChildResource, actions as resourceActions } from './resources'
import Button from './button'
import Input from './input'
import TextArea from './textarea'
import Box, { Flex } from './box'
import exampleData from './example-data'


const featureCalloutsReducer = createReducer([], {
  update: (state, { payload: { id, value }}) => {
    Object.assign(state.find(item => item.id === id), value)
  }
})

const SectionTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  padding: 1rem 0;
`

const FeatureCalloutTitle = styled.h2`
  font-weight: bold;
`

const Field = ({ children }) => <Box padding={{top: 2}}>{children}</Box>


const FeatureCallout = ({ value, onChange }) => (
  <Box flex="1 0 auto">
    <FeatureCalloutTitle>{value.id}</FeatureCalloutTitle>
    <Field>
      <Input label="Label" value={value.label} onChange={(label) => onChange({ label })}/>
    </Field>
    <Field>
      <TextArea label="Description" value={value.description} onChange={(description) => onChange({ description })} />
    </Field>
    <Field>
      <Input label="Call to action" value={value.cta} onChange={(cta) => onChange({ cta })}/>
    </Field>
    <Field>
      <Input label="Link url" value={value.href} onChange={(href) => onChange({ href })}/>
    </Field>
  </Box>
)

const FeatureCallouts = ({ content }) => {
  const [state, dispatch] = useReducer(featureCalloutsReducer, content)
  return (
    <Flex gap={1}>
      {state.map(item => (
        <FeatureCallout key={item.id} value={item} onChange={(value) => dispatch({ type: 'update', payload: { id: item.id, value } })} />
      ))}
    </Flex>
  )
}

const UnifiedStories = ({ content }) => (
  <Box>
    <Field>
      <TextArea label="Headline" value={content.hed} />
    </Field>
    <Field>
      <Input label="Dek" value={content.dek} /> 
    </Field>
    <Field>
      <TextArea label="Summary (markdown)" value={content.summary} minRows={10} />
    </Field>
  </Box>
)


const Editor = () => (
  <section>
    <SectionTitle>Feature Callouts</SectionTitle>
    <FeatureCallouts content={exampleData.featureCallouts} />
    
    <SectionTitle>Unified Stories</SectionTitle>
    <UnifiedStories content={exampleData.unifiedStories} />
    
    <SectionTitle>Featured Embed</SectionTitle>
    
    <SectionTitle>Apps We Love</SectionTitle>
    
    <SectionTitle>Curated Collections</SectionTitle>
    
    <SectionTitle>Start Building</SectionTitle>
  </section>
)


export default Editor

