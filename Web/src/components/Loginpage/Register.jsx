import React, { useContext, useState } from 'react'
import '../css/Register.css'
import { useHistory } from 'react-router';
import { userContext } from '../../App'

function Register(object) {
    // console.log(object);
    let { state, dispatch } = useContext(userContext)
    let [signupdetails, updatesignupdetails] = useState({
        name: "",
        email: "",
        number: "",
        password: "",
        otp: ""
    })

    function setdata(event) {
        let name = event.target.name;
        let value = event.target.value
        updatesignupdetails((prevalue) => {
            return ({
                ...prevalue,
                [name]: value
            })
        })
    }
    let history = useHistory()
    async function signupValidation(event) {
        let { name, email, number, password } = signupdetails;
        try {
            let response = await fetch('/registervarification', {
                method: "POST",
                headers: {
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({
                    name, email, number, password
                })
            })
            // console.log(response);
            // console.log(response.status);
            if (response.status === 200) {
                let res = await response.json()
                // console.log(res);
                dispatch({ type: "LOGIN", user: true, username: res.username, cartcount: 0 })
                history.goBack()
            }
            else if (response.status === 409) {
                window.alert('User Already Exists for this number or email')
            }
        } catch (error) {
            console.log(error);
        }

    }
    function swapForm() {
        object.swapform()
    }
    return (
        <>
            <div className="registerformContainer">
                <div className="registerform">
                    {/* <div className="registerimgContainer">
                                <img src="https://www.undano.com.tr/wp-content/uploads/2016/10/coming-soon-corrected-background-600x800.jpg" alt="" />
                            </div> */}
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        if (signupdetails.password.length >= 8) {
                            signupValidation()
                        } else {
                            window.alert('password should be grater than or equal to 8 characters')
                        }
                    }
                    }>
                        <input type="text" name="name" id="name" placeholder="Enter Name" value={signupdetails.name} onChange={setdata} required={true} autoComplete="off" />
                        <input type="email" name="email" id="email" placeholder="Enter Email" value={signupdetails.email} onChange={setdata} required={true} autoComplete="off" />
                        <input type="number" name="number" id="phone" placeholder="Enter Phone" value={signupdetails.number} onChange={setdata} required={true} autoComplete="off" />
                        <input type="password" name="password" id="password" placeholder="Enter Password" value={signupdetails.password} onChange={setdata} required={true} autoComplete="off" minLength="8" />
                        <button type="submit">Register</button>
                        <p>minimum length of password to be 8 character</p>
                        <p>Already have an Account <span onClick={swapForm}>Login here</span></p>
                    </form>
                </div>



            </div>
        </>
    )
}

export default Register
