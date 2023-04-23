import React from 'react'
import HomeProduct from './HomeProduct'

function Recently_Viewed_Products() {
    let [recentData, updaterecentData] = React.useState([])
    React.useEffect(() => {
        let recentProducts = localStorage.getItem('recentProductsList')
        if (!!recentProducts) {
            let recentProductList = JSON.parse(recentProducts)
            fetch('/getrecentData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ids: recentProductList
                }
                )
            })
                .then(res => res.json())
                .then(data => {
                    updaterecentData(data)
                })
        }

    }, [recentData])
    return (
        <div>
            <h1>Recently Viewed_Products...........</h1>
            <div className="homeproductCollection">
                {recentData && recentData.length > 0 ? (<>
                    <div className="homeproducts">
                        {
                            recentData.map((item) => {
                                return <HomeProduct pdtId={item._id} img={item.image} productName={item.pdt_name} price={item.price} rating={item.rating} />
                            })
                        }
                    </div>
                </>
                ) : (<>
                    <h1>No Recently_Viewed_Products for you yet</h1>
                </>)}
            </div>
        </div>

    )
}

export default Recently_Viewed_Products