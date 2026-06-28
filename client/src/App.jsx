import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Movies from './pages/Movies'
import Moviedetails from './pages/Moviedetails'
import Home from './pages/Home'
import Seatlayout from './pages/Seatlayout'
import Mybookings from './pages/Mybookings'
import Favorite from './pages/Favorite'
import Navbar from './components/Navbar'
import {Toaster} from 'react-hot-toast'
import Footer from './components/Footer'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import Layout from './pages/admin/Layout'
import { useAppContext } from './context/AppContext'
import { SignIn } from '@clerk/react'
import Loading from './components/Loading'

const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  const {user} = useAppContext()
  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar/>}
      <Routes>
        <Route path='/' element={<Home/>} />
         <Route path='/movies' element={<Movies/>} />
         <Route path='/movies/:id' element={<Moviedetails/>} />
         <Route path='/movies/:id/:date' element={<Seatlayout/>} />
         <Route path='/my-bookings' element={<Mybookings/>} />
         <Route path='/loading/:nextUrl' element={<Loading/>} />
         <Route path='/favorite' element={<Favorite/>} />
         <Route path='/admin/*' element={user?<Layout/> : (
          <div  className='min-h-screen flex justify-center items-center'>
            <SignIn fallbackRedirectUrl={'/admin'}/>
          </div>
         )}>
            <Route index element={<Dashboard/>}/>
            <Route path="add-shows" element={<AddShows/>}/>
            <Route path="list-shows" element={<ListShows/>}/>
            <Route path="list-bookings" element={<ListBookings/>}/>
         </Route>
      </Routes>
      {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App