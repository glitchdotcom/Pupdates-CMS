import React, { cloneElement, useEffect } from 'react'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { createSlice } from 'redux-starter-kit'

import { useCurrentUser } from './current-user'
import BaseInput from './input'
import BaseTextArea from './textarea'
import Image from './image'
import Box from './box'
import Button from './button'
import Text from './text'
import { useUploader } from './assets'

const APP_BASE = `https://cooked-devourer.glitch.me`

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
    addedItem: (state, { payload: { path, value } }) => {
      const currentID = get(state.data, path)[0].id
      get(state.data, path).unshift({ ...value, id: currentID + 1 })
    },
    removedItemAtIndex: (state, { payload: { path, index } }) => {
      get(state.data, path).splice(index, 1)
    },
    
    reset: () => ({
      status: 'loading',
      data: null,
    }),
  },
})

const handlers = {
  [actions.addedItem]: debounce(async (store) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    const state = store.getState().homeData.data
    console.log(state)
    await axios.post('/pupdate.json', state, { headers: { Authorization: persistentToken } })
    console.log('updated ok')
  }, 3000),
  [actions.removedItemAtIndex]: debounce(async (store) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    const state = store.getState().homeData.data
    console.log(state)
    await axios.post('/pupdate.json', state, { headers: { Authorization: persistentToken } })
    console.log('updated ok')
  }, 3000),
  [actions.updatedField]: debounce(async (store) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    const state = store.getState().homeData.data
    console.log(state)
    await axios.post('/pupdate.json', state, { headers: { Authorization: persistentToken } })
    console.log('updated ok')
  }, 3000),
  [actions.reset]: async (store) => {
    const { persistentToken } = useCurrentUser.selector(store.getState())
    const { data } = await axios.get(`${APP_BASE}/api/pupdate`)
    console.log("reset", data)
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

const List = ({ items, children, itemComponent: Item = 'li', ...props }) => (
  <Box as="ul" {...props}>
    {items.map((item, index) => (
      <Item key={index}>{children(item, index)}</Item>
    ))}
  </Box>
)

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



const FeatureCallouts = () => {
  const items = usePath(['pupdates'])
  const dispatch = useDispatch()
  const confirmAndRemovePupdate = (id) => {
    if (confirm("Are you sure you want to delete this pupdate? All your changes will be lost.")) {
      dispatch(actions.removedItemAtIndex({ path: ['pupdates'], index:items.map((e) => e.id).indexOf(id) }))
    }
  }
  return (
    <List gap={1} items={items}>
      {({ id }, i) => (
        <Box>
          <SectionTitle>Pupdate {id} &nbsp;
            <Button onClick={() => { confirmAndRemovePupdate(id) }} type="dangerZone">🔥 Remove Pupdate</Button>
          </SectionTitle>
          
          <Field>
            <Input label="Title" path={['pupdates', i, 'title']}/>
          </Field>
          <Field>
            <TextArea label="Description (markdown)" path={['pupdates', i, 'body']}/>
          </Field>
          <Field>
            <ImageInput label="Preview image" path={['pupdates', i, 'image']} />
          </Field>
          <Field>
            <Input label="Image Alt Text" path={['pupdates', i, 'imageAlt']}/>
          </Field>
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
  
  const addPupdate = () => {
    dispatch(actions.addedItem({ value: { title: "", body: "", image:"", imageAlt:"" }, path:['pupdates'] }))
  }
  
  if (homeDataStatus === 'loading') return <Loading />
  
  return (
    <Box as="section" padding={{bottom: 4}}>
      <Text as="h1" size={1}>
        Glitch Pupdate Editor
      </Text>
      <Text as="p">
        All changes auto-save for the preview. To confirm and publish, 
        visit <a href={`${APP_BASE}/pupdates/preview`}>glitch.com/pupdates/preview</a>.
      </Text>
      <Box padding={{ top: 2 }}>
        <Button onClick={confirmThenReset} type="dangerZone">💣 Reset all changes</Button>
      </Box>   
      <Box padding={{ top: 2 }}>
        <Button onClick={addPupdate}>🐶 Add new pupdate</Button>
      </Box> 
      <Box>
        <FeatureCallouts />
      </Box>
    </Box>
  )
}

export default Editor

