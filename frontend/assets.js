import { useEffect } from 'react' 
import axios from 'axios'
import { useCurrentUser } from './current-user'
import S3Uploader from './s3'

const PROJECT_ID = "b3135077-83b5-4d23-ae4d-beb2f5cdc04a"

export function requestFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = event.target.files[0];
      console.log('☔️☔️☔️ input onchange', file);
      resolve(file);
    };
    input.click();
    console.log('input created: ', input);
  })
}

async function upload (file, persistentToken) {
  const { data: policy } = await axios.get(`/projects/${PROJECT_ID}/policy`, { headers: { Authorization: persistentToken } })
  return S3Uploader(policy).upload({ key: file.name, blob: file })
}

export function useUploader () {
  const { persistentToken } = useCurrentUser()
  return () => requestFile().then((blob) => upload(blob, persistentToken))
}