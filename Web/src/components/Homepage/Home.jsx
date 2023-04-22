import React, { useContext } from 'react'
import Header from '../templates/Header'
import home from '../images/home.jpg'
import hp from '../images/hp.png'
import timex from '../images/timex.png'
import samsung from '../images/samsung.png'
import sandisk from '../images/sandisk.png'
import whirlpool from '../images/whirlpool.png'
import { homeData } from '../../App'

import '../css/Home.css'
import HomeProduct from './HomeProduct'
import Footer from '../templates/Footer'
function Home() {
    let homedata = useContext(homeData)
    console.log(homedata);

        return (
            <>
                <Header />

                <div className="homeimg">
                    <img src={home} alt=" " />
                </div>

                <div className="homeproductCollection">
                    {homedata[0] ? (<>
                        <div className="homeproducts">
                            <HomeProduct pdtId={homedata[0]._id} img={homedata[0].image} productName={homedata[0].pdt_name} price={homedata[0].price} rating={homedata[0].rating}/>
                            <HomeProduct pdtId={homedata[1]._id} img={homedata[1].image} productName={homedata[1].pdt_name} price={homedata[1].price} rating={homedata[1].rating}/>
                            <HomeProduct pdtId={homedata[1]._id} img={homedata[1].image} productName={homedata[1].pdt_name} price={homedata[1].price} rating={homedata[1].rating}/>
                        </div>
                    </>
                    ) : (<>

                    </>)}
                </div>
                <Footer/>
            </>
        )
    } 

export default Home
