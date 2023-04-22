import React, { useContext, useEffect, useState } from 'react'
import '../css/Checkout.css'
import Header from '../templates/Header'
import Productdetails from './Productdetails'
import { checkoutContext, userContext } from '../../App'
import { useHistory } from 'react-router'
import Footer from '../templates/Footer'
import PaymentPage from './PaymentPage'
import useRazorpay from "react-razorpay";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function Checkout() {
    const [show, setShow] = useState(false);
    const [success, setSuccess] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState("");
    const [orderID, setOrderID] = useState(false);
    let { state, dispatch } = useContext(userContext)
    let { checkout, checkoutdispatch } = useContext(checkoutContext)
    let history = useHistory()
    let [username, updateusername] = useState()
    let [checkoutsuccess, donecheckout] = useState(0)
    let [checkoutaddress, updatecheckoutadress] = useState({
        address: "",
        pincode: ""
    })
    let [onlinePaymentmode, updateOnlinePaymentcontainer] = useState(0)
    let [paymenttext, updatePaymenttext] = useState(0)
    let [totalAmount, updateTotalsmount] = useState()
    function returntotalamount(object) {
        updateTotalsmount(object)
    }
    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    description: "Products",
                    amount: {
                        currency_code: "USD",
                        value: totalAmount,
                    },
                },
            ],
        }).then((orderID) => {
            setOrderID(orderID);
            return orderID;
        });
    };

    // check Approval
    const onApprove = (data, actions) => {
        return actions.order.capture().then(function (details) {
            const { payer } = details;
            setSuccess(true);
        });
    };

    //capture likely error
    const onError = (data, actions) => {
        setErrorMessage("An Error occured with your payment ");
    };


    async function getCheckoutaddress() {
        try {
            let responce = await fetch('/getcheckoutaddress', {
                method: "POST",
                headers: {
                    "Content-type": "Application/json"
                }
            })
            // console.log(responce);
            let res = await responce.json()
            // console.log(res);
            updateusername(res.name)
            if (res.address !== null && res.pincode !== 0) {
                updatecheckoutadress({ address: res.address, pincode: res.pincode })
            }
        } catch (error) {
            console.log(error);
        }
    }

    function editAddress(event) {
        updatecheckoutadress((prevalue) => {
            return ({
                ...prevalue,
                [event.target.name]: event.target.value
            })
        })
    }

    function getcheckedValue(event) {
        let checkedvalue = document.querySelector('input[name="payment"]:checked')
        // console.log(checkedvalue.value);
        if (checkedvalue === null) {
            return null
        } else {
            return checkedvalue.value
        }
    }

    async function placetheorder(object) {
        // console.log(username);
        try {
            let response = await fetch('/placetheorder', {
                method: "POST",
                headers: {
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({
                    useraddress: checkoutaddress.address,
                    userpincode: checkoutaddress.pincode,
                    username: username,
                    paymentoption: object,
                })
            })
            return response.status
        } catch (error) {
            console.log(error);
        }
    }

    async function PlaceOrder(event) {
        if (checkoutaddress.address !== "" && checkoutaddress.pincode !== "") {
            let paymentOption = getcheckedValue()
            if (paymentOption !== null) {
                if (paymentOption === 'Cash') {
                    // console.log("placed");
                    let status = await placetheorder(paymentOption)
                    // console.log(status);
                    // window.alert("Your Order is successfully Placed")
                    if (status === 200) {
                        dispatch({ type: "EmptyCart" })
                        donecheckout(1)
                        let setinteval = setInterval(() => {
                            checkoutdispatch({ type: "ExitCheckout", checkout: false })
                            history.push('/')
                            clearInterval(setinteval)
                        }, 8000);
                    }
                    else {
                        window.alert('some erroe occurred please try again later')
                    }
                }
                else {
                    // console.log("online payment");
                    setShow(true)
                }
            } else {
                window.alert('Please Choose The Payment Option')
            }

        }
        else {
            // console.log("address can`t be empty");
            window.alert("Please fill the address feild")

        }
    }

    useEffect(() => {
        getCheckoutaddress()
        if (success) {
            alert("Payment successful!!");
            console.log('Order successful . Your order id is--', orderID);
        }
    }, [success])

    if (checkout.checkout === false) {
        history.push('/cart')
    }
    return (
        <>
            <PayPalScriptProvider options={{ "client-id": "Abw7kKCZDtyM-S8nrUhSlsQ8Y7XQyMdpPrPfhpVm8R3ReHqzwixIZuFZJQ3rXLTq4BbPYJ8dS2kX8hHn" }}>
                <Header />



                {
                    checkoutsuccess === 0 ? (
                        <>
                            <div className="checkoutHeadings">
                                <h2 style={{ textAlign: "center" }}> Order Summury </h2>
                            </div>
                            <div className="checkoutProducts">
                                <Productdetails returntotalamount={returntotalamount} />
                            </div>
                            <div className="checkoutHeadings">
                                <h2 style={{ textAlign: "center" }}> Choose Payment Option </h2>
                            </div>
                            <div className="deliveryOptions">
                                <div className="paymentoption">
                                    <div className="cash" >
                                        <input type="radio" name="payment" id="cash" value="Cash" />
                                        <label htmlFor="cash" id="cashondelivery" onClick={() => {
                                            updatePaymenttext(1)
                                        }}>Cash on delivery</label>
                                    </div>
                                    <div className="online" >
                                        <input type="radio" name="payment" id="online" value="Online" />
                                        <label htmlFor="online" id="onlinepayment" onClick={() => {
                                            updatePaymenttext(2)
                                        }}>Online Payment</label>
                                    </div>
                                </div>
                            </div>
                            <div className="checkoutHeadings">
                                <h2 style={{ textAlign: "center" }}> Address details </h2>
                            </div>
                            <div className="checkoutaddress">
                                <div className="checkounteditaddress">
                                    <h2 >Your Address : </h2>
                                    <textarea type="text" name="address" id="address" placeholder="Enter your address" value={checkoutaddress.address} onChange={editAddress} />
                                </div>
                                <div className="checkounteditpincode">
                                    <h2>Your pincode : </h2>
                                    <input type="number" name="pincode" id="pincode" placeholder="Enter pincode" value={checkoutaddress.pincode} onChange={editAddress} />
                                </div>
                                <p style={{ padding: "20px" }}>Note : If you have updated your address in your account then the address field will get automatically filled else you have to enter your address</p>
                            </div>

                            <div className="placeOrder">
                                <button onClick={PlaceOrder}>
                                    {paymenttext === 0 ? (
                                        <>
                                            Pay Now
                                        </>
                                    ) : (
                                        <>
                                            {
                                                paymenttext === 1 ? (
                                                    <>
                                                        Place Order
                                                    </>
                                                ) : (
                                                    <>
                                                        <PayPalButtons
                                                            style={{ layout: "vertical" }}
                                                            createOrder={createOrder}
                                                            onApprove={onApprove}
                                                        />
                                                    </>
                                                )
                                            }
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="checkoutsuccess">
                                <img src="https://i.pinimg.com/originals/0d/e4/1a/0de41a3c5953fba1755ebd416ec109dd.gif" alt="" />
                                <h1>Done!</h1>
                                <h1>🎉 Your Order is Placed 🎉</h1>
                            </div>
                        </>
                    )
                }




               


                <Footer />
            </PayPalScriptProvider>
        </>
    )
}

export default Checkout
