import { useState } from "react"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from './../firebase';

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  const [imageUploadError, setImageUplaodError] = useState(false);
  console.log(formData);

  const [uploading, setUploading] = useState(false);

  const imageSubmitHandler = (e) => {
    e.preventDefault();
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true)
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]))
      }
      Promise.all(promises).then((urls) => {
        setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) })
        setImageUplaodError(true)
        setUploading(false)
      }).catch((err) => {
        console.log(err);
        setImageUplaodError("Image Upload Failed (2 MB max per Image)")
        setUploading(false)
      })
    } else {
      setImageUplaodError("You can only upload 6 Images per listing")
      setUploading(false)
    }
  }

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed", (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log(progress);
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL)
          })
        }
      )
    })
  }

  const ImageRemoveHandler = (index) => {
      setFormData({
        ...formData,
        imageUrls: formData.imageUrls.filter((_,i) => i !== index)
      })
  }
  return (
    <div className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Create a Listing</h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input type="text" placeholder="Name" className="border p-3 rounded-lg" id="name" maxLength="62" minLength="10" required></input>
          <textarea type="text" placeholder="Description" className="border p-3 rounded-lg" id="description" required></textarea>
          <input type="text" placeholder="Address" className="border p-3 rounded-lg" id="address" required></input>
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5"></input>
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5"></input>
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5"></input>
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5"></input>
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5"></input>
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input type="number" id="bedrooms" min="1" max="10" className="p-3 border border-gray-300 rounded-lg" required></input>
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" id="bathrooms" min="1" max="10" className="p-3 border border-gray-300 rounded-lg" required></input>
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" id="regularprice" min="1" max="10" className="p-3 border border-gray-300 rounded-lg" required></input>
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / Month)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" id="discountprice" min="1" max="10" className="p-3 border border-gray-300 rounded-lg" required></input>
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                <span className="text-xs">($ / Month)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">Images:<span className="font-normal text-gray-600 ml-2">The first image will be the cover (max 6)</span></p>

          <div className="flex gap-4">
            <input type="file" onChange={(e) => setFiles(e.target.files)} id="images" className="p-3 border border-gray-300 rounded w-full" accept="image/*" multiple></input>
            <button type="button" onClick={imageSubmitHandler} className="p-3 text-green-700 uppercase rounded border border-green-700 hover:bg-green-700 hover:text-white hover:duration-700 hover:shadow-lg">
            {uploading === true ? "Uploading..." : "Upload"}</button>
          </div>
          <p className="text-red-700 font-semibold">{imageUploadError && imageUploadError}</p>
          {
            formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url,index) => (
              <div key={url} className='flex justify-between p-3 border items-center' >
                <img src={url} alt='listing image' className='w-20 h-20 object-contain rounded-lg' />
                <button type='button' onClick={() => ImageRemoveHandler(index)} className='p-3 text-red-700 rounded-lg font-semibold uppercase hover:opacity-75'>Delete</button>
              </div>
            ))
          }
          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95">Create Listing</button>
        </div>
      </form>
    </div>
  )
}
