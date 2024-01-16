import { useDispatch, useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signoutUserStart, signoutUserSuccess, signoutUserFailure } from '../redux/user/userSlice';
import { Link } from 'react-router-dom'

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector(state => state.user);
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
      // console.log(progress);
      setFileperc(Math.round(progress))
      // console.log(`Upload is ${progress}% done`);
    },
      (error) => {
        setFileUploadError(true)
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        )
      }
    );
  }

  // console.log(formData.avatar);
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  const changeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const dispatch = useDispatch();
  const [updateSuccess, setUpdateSuccess] = useState();

  // UpdateUser
  const formSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart())

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json();
      // console.log("data",data);
      if (data.success === false) {
        dispatch(updateUserFailure(data.message))
        return;
      }

      dispatch(updateUserSuccess(data))
      setUpdateSuccess(true)
    } catch (error) {
      dispatch(updateUserFailure(error.message))
    }
  }

  // DeleteUser
  const userDeleteHandler = async () => {
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      })
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message))
        return;
      }
      dispatch(deleteUserSuccess(data))
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  // SignOut User
  const userSignoutHandler = async () => {
    try {
      dispatch(signoutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signoutUserFailure(data.message))
        return;
      }
      dispatch(signoutUserSuccess(data))
    } catch (error) {
      dispatch(signoutUserFailure(error.message))
    }
  }
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={formSubmitHandler} className='flex flex-col gap-3'>
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
        <input type='text' id='username' defaultValue={currentUser.username} onChange={changeHandler} placeholder='Username' className='border p-3 rounded-lg'></input>
        <input type='text' id='email' defaultValue={currentUser.email} onChange={changeHandler} placeholder='Email' className='border p-3 rounded-lg'></input>
        <input type='password' id='password' onChange={changeHandler} placeholder='Password' className='border p-3 rounded-lg'></input>

        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>{loading ? "Loading...." : "Update"}</button>
        <Link to={"/create-listing"} className='bg-green-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80 text-center'>Create Listing</Link>
      </form>

      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer' onClick={userDeleteHandler}>Delete Account</span>
        <span className='text-red-700 cursor-pointer' onClick={userSignoutHandler}>Sign Out</span>
      </div>

      <p className='text-red-700 mt-5 text-center font-semibold'>{error ? error : ""}</p>
      <p className='text-green-700 mt-5 text-center font-semibold'>{updateSuccess ? "Your Profile Updated Successfully....!" : ""}</p>
    </div>
  )
}
