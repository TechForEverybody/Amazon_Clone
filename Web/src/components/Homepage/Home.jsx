import React, { useContext, useEffect } from 'react'
import Header from '../templates/Header'
import home from '../images/home.jpg'
import img1 from "../images/img1.jpeg"
import img2 from "../images/img2.jpeg"
import img3 from "../images/img3.jpg"
import { homeData } from '../../App'

import '../css/Home.css'
import HomeProduct from './HomeProduct'
import Footer from '../templates/Footer'
import Recommendation from './Recommendation'
import Recently_Viewed_Products from './Recently_Viewed_Products'
function Home() {
    let homedata = useContext(homeData)
    console.log(homedata);
    let [currentImage, setCurrentImage] = React.useState(0)
    function returnCurrentImage(currentImage) {
        if(currentImage===0){
            return home
        }else if(currentImage===1){
            return img1
        }else if(currentImage===2){
            return img2
        }else if(currentImage===3){
            return img3
        }
    }
    useEffect(()=>{
        let interval = setInterval(()=>{
                setCurrentImage((currentImage+1)%4)
            
        },3000)
    },[])
    return (
        <>
            <Header />

            <div className="homeimg">
                <img src={returnCurrentImage(currentImage)} alt=" " />
            </div>

            <div className="homeproductCollection">
                {homedata[0] ? (<>
                    <div className="homeproducts">
                        <HomeProduct pdtId={homedata[0]._id} img={homedata[0].image} productName={homedata[0].pdt_name} price={homedata[0].price} rating={homedata[0].rating} />
                        <HomeProduct pdtId={homedata[1]._id} img={homedata[1].image} productName={homedata[1].pdt_name} price={homedata[1].price} rating={homedata[1].rating} />
                        <HomeProduct pdtId={homedata[1]._id} img={homedata[1].image} productName={homedata[1].pdt_name} price={homedata[1].price} rating={homedata[1].rating} />
                    </div>
                </>
                ) : (<>

                </>)}
            </div>
            <Recommendation />
            <Recently_Viewed_Products />
            <Footer />
        </>
    )
}

export default Home
