import axios from 'axios'
import { useCurrentUser } from './current-user'

const PROJECT_ID = "b3135077-83b5-4d23-ae4d-beb2f5cdc04a"

function useUploader () {
  const { persistentToken } = useCurrentUser()  
}