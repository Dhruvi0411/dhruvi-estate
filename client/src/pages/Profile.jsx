import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser } = useSelector(state => state.user);
  const [file, setFile] = useState(undefined);
  // console.log(file);
  const [filePerc, setFileperc] = useState(0)
  // console.log(filePerc);

  const [fileUploadError, setFileUploadError] = useState(false);
  // console.log(fileUploadError)
  const [formData, setFormData] = useState({});
  // console.log(formData)

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {

    const storage = getStorage(app);
    // console.log(file.name);
    const fileName = new Date().getTime() + file.name;
    // console.log(fileName);
    const storageRef = ref(storage, fileName);
    // console.log(storageRef);
    const uploadTask = uploadBytesResumable(storageRef, file)
    // console.log(uploadTask);
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFileperc(Math.round(progress))
      // console.log(`Upload is ${progress}% done`);
    },
      (error) => {
        setFileUploadError(true)
        // console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        )
      }
    );
  }
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'></input>
        <img onClick={() => fileRef.current.click()} src={formData.avatar || currentUser.avatar} className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' alt="Profile"></img>
        <p className='text-sm self-center'>
          {
            fileUploadError ?
              (<span className='text-red-700 font-semibold'>Error Image upload(image must be less than 2 MB)</span>) :
              filePerc > 0 && filePerc < 100 ? (
                <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
              ) :
                filePerc === 100 ? (
                  <span className='text-green-700'>Image Successfully Uploaded!</span>
                ) : ""
          }
        </p>
        <input type='text' placeholder='Username' className='border p-3 rounded-lg'></input>
        <input type='text' placeholder='Email' className='border p-3 rounded-lg'></input>
        <input type='text' placeholder='Password' className='border p-3 rounded-lg'></input>

        <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>Update</button>
      </form>

      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer'>Delete Account</span>
        <span className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>
    </div>
  )
}
