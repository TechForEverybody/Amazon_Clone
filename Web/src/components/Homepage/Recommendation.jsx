import React from 'react'
import HomeProduct from './HomeProduct'

function Recommendation() {
    let [recommendData, updateRecommendData] = React.useState([])
    React.useEffect(() => {
        let recentProducts = localStorage.getItem('recentProductsList')
        if (!!recentProducts) {
            let recentProductList = JSON.parse(recentProducts)
            fetch('/recommendForUnloggedInUser', {
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
                    updateRecommendData(data)
                })
        }
    }, [recommendData])
    return (
        <div>
            <h1>Recommendation for you...........</h1>
            <div className="homeproductCollection">
                {recommendData && recommendData.length > 0 ? (<>
                    <div className="homeproducts">
                        {
                            recommendData.map((item) => {
                                return <HomeProduct pdtId={item._id} img={item.image} productName={item.pdt_name} price={item.price} rating={item.rating} />
                            })
                        }
                    </div>
                </>
                ) : (<>
                    <h1>No Recommendation for you yet</h1>
                </>)}
            </div>
        </div>

    )
}

export default Recommendation