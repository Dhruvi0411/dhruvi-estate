import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice'
import Gauth from '../components/Gauth'

export default function SignUp() {
  const [formData, setFormData] = useState({})
  // const [error, setError] = useState(null)
  // const [loading, setLoading] = useState(false)
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // setLoading(true);
      dispatch(signInStart());
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      // console.log(data);
      if (data.success === false) {
        // setLoading(false);
        // setError(data.message);
        dispatch(signInFailure(data.message))
        return;
      }
      // setLoading(false);
      // setError(null);
      dispatch(signInSuccess(data));
      navigate('/sign-in');
    } catch (error) {
      dispatch(signInFailure(error.message))
      // setLoading(false);
      // setError(error.message);
    }
  }
  // console.log("Form Data", formData);
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>

      <form className="flex flex-col gap-4" onSubmit={submitHandler}>
        <input type="text" placeholder="Username" className="border p-3 rounded-lg" id="username" onChange={changeHandler}></input>
        <input type="text" placeholder="Email" className="border p-3 rounded-lg" id="email" onChange={changeHandler}></input>
        <input type="password" placeholder="Password" className="border p-3 rounded-lg" id="password" onChange={changeHandler}></input>

        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">{loading ? 'Loading...' : 'Sign Up'}</button>
        <Gauth></Gauth>
      </form>
      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to={"/sign-in"}><span className='text-blue-700'>Sign In</span></Link>
      </div>
      {error && <p className='text-red-500 mt-5 text-center'>{error}</p>}
    </div>
  )
}
