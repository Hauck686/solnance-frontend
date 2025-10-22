import axios from 'axios'

export async function uploadToCloudinary (file) {
  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', 'thurderxtorm')
  data.append('folder', 'receipts')

  try {
    //('Uploading to Cloudinary...', file.name)
    const res = await axios.post(
      'https://api.cloudinary.com/v1_1/da26wgev2/image/upload',
      data
    )
    return res.data.secure_url
  } catch (err) {
    console.error('Cloudinary upload error:', err.response?.data || err.message)

    return null
  }
}
