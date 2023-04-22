const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const mongoose = require("mongoose")
const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use(
    session({
        secret: "ShivkumarChauhan",
        resave: false,
        saveUninitialized: true,
        maxAge: Date.now() + 150000,
    })
);

dotenv.config({
    path: "./config.env",
});
const Database = process.env.DATABASE;
let port = process.env.PORT || 80;

if (process.env.NODE_ENV === "production") {
    app.use(express.static("e-commerce-app/build"));
    app.get("*", (req, res) => {
        res.sendFile(
            path.resolve(__dirname, "Web", "build", "index.html")
        );
    });
}

mongoose.connect(Database, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

db = mongoose.connection;
db.once("open", () => {
    console.log("connected to database");
});

let userschema = new mongoose.Schema({
    name: String,
    email: String,
    number: Number,
    password: String,
    address: {
        type: String,
        default: null,
    },
    pincode: {
        type: Number,
        default: 0,
    },
});
// console.log(userschema);

let productschema = new mongoose.Schema({
    pdt_id: Number,
    pdt_name: String,
    price: Number,
    type: String,
    availablity: String,
    image: String,
    images: Object,
    specification: Object,
    cat_id: Number,
    pro_cat_id: Number,
    Sub_cat_id: Number,
    pdt_desc: String,
    rating: Number,
});

// console.log(productschema);

function getexcepteddate(object = 10) {
    let date = new Date();
    date.setDate(date.getDate() + object);
    return date.toString();
}

let orderproductschema = new mongoose.Schema({
    pdt_id: String,
    product_name: String,
    image: String,
    count: Number,
    price: Number,
    deliveryStatus: {
        type: Boolean,
        default: false,
    },
    excepteddeliverydate: String,
    paymentMode: String,
    username: String,
    useremail: String,
    useraddress: String,
    pincode: Number,
    date_of_order: {
        type: Date,
        default: Date,
    },
    ispackednote: {
        type: String,
        default: null,
    },
    packingdate: {
        type: Date,
        default: null,
    },
    isshippednote: {
        type: String,
        default: null,
    },
    shippingdate: {
        type: Date,
        default: null,
    },
    branchname: {
        type: String,
        default: null,
    },
    branchreachingdate: {
        type: Date,
        default: null,
    },
    branchleftingdate: {
        type: Date,
        default: null,
    },
    nearreachingdate: {
        type: Date,
        default: null,
    },
    hubname: {
        type: String,
        default: null,
    },
    outofdelieverydatetime: {
        type: Date,
        default: null,
    },
    outofdelieverynote: {
        type: String,
        default: null,
    },
    otpfordelivery: {
        type: Number,
        default: null,
    },
    date_of_delivery: {
        type: Date,
        default: null,
    },
    feedbackstars: {
        type: Number,
        default: 0,
    },
});
// console.log(orderproductschema);

let feedbackschema = new mongoose.Schema({
    username: String,
    product_id: String,
    stars: Number,
    feedbackdesc: String,
    feedbackDate: {
        type: String,
        default: Date(),
    },
});

let cartdetailsschema = new mongoose.Schema({
    useremail: String,
    product_count: Number,
    pdt_id: String,
    pdt_name: String,
    price: String,
    image: String,
});


let userdetails = mongoose.model("userdetails", userschema);
let products = mongoose.model("products", productschema);
let orderdetails = mongoose.model("ordersdetaills", orderproductschema);
let cartdetails = mongoose.model("cartdetails", cartdetailsschema);
let feedbackdetails = mongoose.model("feedbackdetails", feedbackschema);

const redirectlogin = (req, res, next) => {
    if (!req.session.useremail) {
        res.status(407).send("user is not logged in");
    } else {
        next();
    }
};

const redirecthome = (req, res, next) => {
    if (req.session.useremail) {
        res.status(403).send("bad request");
    } else {
        next();
    }
};

app.post("/authunicateuser", (req, res) => {
    if (req.session.useremail) {
        cartdetails
            .find({
                useremail: req.session.useremail,
            })
            .count((err, count) => {
                // console.log(count);
                res.status(200).send({
                    username: req.session.username,
                    cartcount: count,
                });
            });
    } else {
        res.status(404).send({
            user: false,
        });
    }
});

app.post("/get", (req, res) => {
    // console.log(req.sessionID);
    if (req.session.username) {
        // console.log(req.session.username);
    }
    console.log("home requested");
    products.aggregate(
        [
            {
                $sample: {
                    size: 7,
                },
            },
        ],
        (err, data) => {
            res.setHeader("Content-Type", "Application/json");
            res.status(200).send(data);
            // console.log(data);
            if (err) {
                console.log(err);
            }
        }
    );
});

// products.aggregate([{$sample:{size:7}}],(err,data)=>{
//     console.log(data);
//     console.log(err);
// })

app.post("/login", redirecthome, (req, res) => {
    // console.log(req.body);
    let entry = {
        email: req.body.email.toLowerCase(),
        password: req.body.password,
    };
    // console.log(entry);
    userdetails.findOne(
        {
            email: entry.email,
        },
        (err, data) => {
            // console.log(data);
            if (data !== null) {
                bcrypt.compare(
                    entry.password,
                    data.password,
                    function (err, result) {
                        if (result === true) {
                            req.session.username = data.name.split(" ")[0];
                            req.session.userid = data.user_id;
                            req.session.useremail = data.email;
                            // console.log(req.session.username);
                            req.session.save((err) => {
                                if (err) {
                                    console.log("error on session saving", err);
                                } else {
                                    cartdetails
                                        .find({
                                            useremail: req.session.useremail,
                                        })
                                        .count((err, count) => {
                                            res.json({
                                                username:
                                                    data.name.split(" ")[0],
                                                user_id: data.user_id,
                                                cartcount: count,
                                            });
                                        });
                                }
                            });
                        } else {
                            res.status(406).send("invalid credentials");
                        }
                    }
                );
            } else {
                res.status(404).send({
                    message: "user not found",
                });
            }
        }
    );
});

app.post("/registervarification", redirecthome, (req, res) => {
    // console.log(req.sessionID);
    // console.log(req.body);
    userdetails.findOne(
        {
            $or: [
                {
                    email: req.body.email,
                },
                {
                    number: req.body.number,
                },
            ],
        },
        (err, data) => {
            if (data === null) {
                bcrypt.hash(req.body.password, 12, function (err, hash) {
                    // console.log(hash);
                    let entry = {
                        name: req.body.name.toLowerCase(),
                        email: req.body.email.toLowerCase(),
                        number: req.body.number,
                        password: hash,
                    };
                    // console.log(entry);
                    let userdetail = new userdetails(entry);
                    userdetail.save((err, data) => {
                        if (err) {
                            console.log(err);
                        }
                        req.session.username = data.name.split(" ")[0];
                        req.session.userid = data.user_id;
                        req.session.useremail = data.email;
                        // console.log(req.session.username);
                        req.session.save((err) => {
                            if (err) {
                                console.log("error on saving", err);
                            }
                        });
                        res.json({
                            username: data.name.split(" ")[0],
                            user_id: data.user_id,
                        });
                    });
                });
            } else {
                res.status(409).send("done");
            }
        }
    );
});


app.post("/getproductdata", (req, res) => {
    // console.log(req.body);
    products.findOne(
        {
            _id: req.body.product_id,
        },
        (err, data) => {
            // console.log(data);
            if (data) {
                feedbackdetails.find(
                    {
                        product_id: req.body.product_id,
                    },
                    (err, review_data) => {
                        if (review_data.length > 0) {
                            res.status(200).json({
                                product_data: data,
                                review_data: review_data,
                            });
                        } else {
                            res.status(200).json({
                                product_data: data,
                                review_data: null,
                            });
                        }
                    }
                );
            } else {
                res.status(403).send({
                    message: "data not available",
                });
            }
        }
    );
});

app.post("/getproductsdata", (req, res) => {
    // console.log(req.body);
    products.find(
        {
            pro_cat_id: req.body.product_cat_id,
        },
        (err, data) => {
            // console.log(data);
            if (data) {
                res.status(200).json(data);
            } else {
                res.status(403).send({
                    message: "data not available",
                });
            }
        }
    );
});

app.post("/getsearchresults", (req, res) => {
    // console.log(req.body);
    search_string = '"' + req.body.searchText + '"';
    products.find(
        {
            $text: {
                $search: search_string,
            },
        },
        (err, data) => {
            // console.log(data);
            if (data.length > 0) {
                res.status(200).json({
                    maindata: data,
                    extradata: null,
                });
            } else {
                products.find(
                    {
                        $text: {
                            $search: req.body.searchText,
                        },
                    },
                    (err, extradata) => {
                        // console.log(extradata);
                        if (extradata.length > 0) {
                            res.status(200).json({
                                maindata: null,
                                extradata: extradata,
                            });
                        } else {
                            res.status(403).send([
                                {
                                    message: "data not available",
                                },
                            ]);
                        }
                    }
                );
            }
        }
    );
});

app.post("/addtocart", redirectlogin, (req, res) => {
    // console.log(req);
    // console.log(req.body);
    products.findOne(
        {
            _id: req.body.product_id,
        },
        (err, data) => {
            cartdetails.findOne(
                {
                    useremail: req.session.useremail,
                    pdt_id: req.body.product_id,
                },
                (err, cart) => {
                    // console.log(cart);
                    if (cart === null) {
                        // console.log(data);
                        entry = {
                            useremail: req.session.useremail,
                            product_count: 1,
                            pdt_id: data._id,
                            pdt_name: data.pdt_name,
                            price: data.price,
                            image: data.image,
                        };
                        // console.log(entry);
                        let cartdata = new cartdetails(entry);
                        cartdata.save((err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        res.status(200).send({
                            message: "addes to cart",
                        });
                    } else {
                        res.status(409).send({
                            message: "product is already in the cart",
                        });
                    }
                }
            );
        }
    );
});

app.post("/getcartdata", redirectlogin, (req, res) => {
    cartdetails.find(
        {
            useremail: req.session.useremail,
        },
        (err, data) => {
            // console.log(data);
            if (data.length === 0) {
                res.status(404).send([]);
            } else {
                res.status(200).json(data);
            }
        }
    );
});

app.post("/deletecartitem", redirectlogin, (req, res) => {
    // console.log(req.body);
    cartdetails.deleteOne(
        {
            _id: req.body.item_id,
        },
        (err, data) => {
            // console.log(data);
            if (data.deleteedCount === 1) {
                res.status(200).send({
                    message: "hello",
                });
            } else {
                res.status(404).send({
                    message: "not deleted",
                });
            }
            // console.log(err);
        }
    );
});

app.post("/updatecount", redirectlogin, (req, res) => {
    // console.log(req.body);
    cartdetails.updateOne(
        {
            _id: req.body.item_id,
        },
        {
            $set: {
                product_count: req.body.count,
            },
        },
        (err, data) => {
            // console.log(data);
            res.status(200).send({
                message: "done updated count",
            });
        }
    );
});

app.post("/account", redirectlogin, (req, res) => {
    // console.log(req.body);
    userdetails.findOne(
        {
            email: req.session.useremail,
        },
        (err, data) => {
            // console.log(data);
            orderdetails
                .find(
                    {
                        useremail: req.session.useremail,
                    },
                    (err, orders) => {
                        // console.log(orders);
                        res.status(200).json({
                            userdata: {
                                name: data.name,
                                address: data.address,
                                pincode: data.pincode,
                                email: data.email,
                                number: data.number,
                            },
                            orderdata: orders,
                        });
                    }
                )
                .sort({
                    date_of_order: -1,
                });
        }
    );
});

app.post("/updateaddress", redirectlogin, (req, res) => {
    // console.log(req.body);
    userdetails.updateOne(
        {
            email: req.session.useremail,
        },
        {
            $set: {
                address: req.body.address,
                pincode: req.body.pincode,
            },
        },
        (err, data) => {
            // console.log(data);
            if (err) {
                console.log(err);
            } else {
                res.status(200).send("address updated");
            }
        }
    );
});

app.post("/getcheckoutProductData", redirectlogin, (req, res) => {
    cartdetails.find(
        {
            useremail: req.session.useremail,
        },
        (err, data) => {
            // console.log(data);
            res.send(data);
        }
    );
});

app.post("/getcheckoutaddress", redirectlogin, (req, res) => {
    userdetails.findOne(
        {
            email: req.session.useremail,
        },
        (err, data) => {
            // console.log(data);
            res.json({
                name: data.name,
                address: data.address,
                pincode: data.pincode,
            });
        }
    );
});

app.post("/placetheorder", redirectlogin, (req, res) => {
    // console.log(req.body);
    cartdetails.find(
        {
            useremail: req.session.useremail,
        },
        (err, data) => {
            let recieptemail = req.session.useremail;
            let recieptbody = `Dear user \nYour Order details are as follows\n`;
            let htmlbody = ` 
        <p style="padding: 1px;
margin: 0px;">Dear User</p>
    <p style="padding: 1px;
margin: 0px;">Your Order Details are as follows</p>
    <h4 style="padding: 1px;
margin: 0px;margin-top:7px;">Buyer Name : ${req.body.username}</h4>
    <p style="font-size: 13px;padding: 1px;
            margin: 0px;margin-bottom:20px">Delivery Address : ${req.body.useraddress} , ${req.body.userpincode}</p>
        `;
            let totalamount = 0;
            let i = 1;
            excepteddate = 10;
            if (
                req.body.userpincode - 400000 > 0 &&
                req.body.userpincode - 400000 < 20000
            ) {
                excepteddate = 5;
            } else if (
                req.body.userpincode - 400000 > 0 &&
                req.body.userpincode - 400000 < 100000
            ) {
                excepteddate = 9;
            } else {
                excepteddate = 15;
            }
            data.forEach((value) => {
                let entry = {
                    pdt_id: value.pdt_id,
                    product_name: value.pdt_name,
                    image: value.image,
                    count: value.product_count,
                    price: value.price,
                    paymentMode: req.body.paymentoption,
                    username: req.body.username,
                    useremail: req.session.useremail,
                    useraddress: req.body.useraddress,
                    pincode: req.body.userpincode,
                    excepteddeliverydate: getexcepteddate(excepteddate),
                };
                totalamount = totalamount + entry.price * entry.count;
                // console.log(entry);
                let orderdetail = new orderdetails(entry);
                recieptbody =
                    recieptbody +
                    `\n${i}) ${orderdetail.product_name}\n\tNo. of counts : ${orderdetail.count}\n\tPrice per count : ${orderdetail.price}\n\tBuyer name : ${orderdetail.username}\n\tDelivery Address : ${orderdetail.useraddress} ,${orderdetail.pincode}\n\tproduct Transaction Id : ${orderdetail._id}\n`;
                // console.log(orderdetail);
                htmlbody =
                    htmlbody +
                    `
            <div class="messagecontainer" style="display: flex;
            align-items: center;
            padding: 1px;
            margin: 1px;
            border: 1px solid aqua;">
                    <div class="imagecontainer"  style="display: flex;justify-content:center;align-items:center;margin:5px;">
                        <img src=${orderdetail.image} width="70" alt="img">
                    </div>
                    <div class="details" >
                        <h4 style="padding: 2px 1px;
                        margin: 0px;">${orderdetail.product_name}</h4>
                        <p style="padding: 1px;
                        margin: 0px;">Price per count : ${orderdetail.price}</p>
                        <p style="padding: 1px;
                        margin: 0px;">No. of count : ${orderdetail.count}</p>
                        <p style="padding: 1px;
                        margin: 0px;">Order Id : ${orderdetail._id}</p>
                    </div>
                </div>
            `;
                orderdetail.save((error, data) => {
                    if (error) {
                        console.log(error);
                    }
                });
                // console.log(value.pdt_name);
                i++;
            });
            let paidstatus = "Payable";
            if (req.body.paymentoption === "Cash") {
                paidstatus = "Payable";
            } else {
                paidstatus = "Paid";
            }
            htmlbody =
                htmlbody +
                `
        <div style="text-align: center;margin:10px">Total ${paidstatus} Amount : <span style="color: coral;font-weight:bold;font-size:150%;">${totalamount}</span></div>
    <h5 style="text-align: right;padding: 1px;
    margin: 0px; ">Thanks for using are website</h5>
    <h5 style="text-align: right; padding: 1px;
    margin: 0px;">From Amazon</h5>
        `;
            recieptbody =
                recieptbody +
                `\nTotal ${paidstatus} Amount : ${totalamount}\n\n\nThanks for using are website\nfrom Amazon`;
            // console.log("Email for reciept : "+recieptemail);
            // console.log(recieptbody);
            // console.log(htmlbody);
            let maildetails = {
                from: "Amazon",
                to: recieptemail,
                subject: "Reciept of order",
                text: recieptbody,
                html: htmlbody,
            };
            cartdetails.deleteMany(
                {
                    useremail: req.session.useremail,
                },
                (err, data) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        }
    );
    res.status(200).send("placed");
});

app.post("/getfeedbackforproduct", redirectlogin, (req, res) => {
    // console.log(req.body);
    orderdetails.updateOne(
        {
            _id: req.body.transaction_id,
        },
        {
            $set: {
                feedbackstars: req.body.starvalue,
            },
        },
        (err, acknowledge) => {
            if (err) {
                console.log(err);
            }
            // console.log(acknowledge);
        }
    );
    feedbackdetails.find(
        {
            product_id: req.body.product_id,
        },
        (err, data) => {
            // console.log(data);
            let overallrating = 0;
            let count = 0;
            if (data.length > 0) {
                // console.log('if');
                data.forEach((element) => {
                    overallrating = overallrating + element.stars;
                    count++;
                });
                overallrating = overallrating + req.body.starvalue;
                count++;
                overallrating = overallrating / count;
            } else {
                // console.log('else');
                overallrating = req.body.starvalue;
            }
            // console.log(overallrating);
            // console.log(count);
            products.updateOne(
                {
                    _id: req.body.product_id,
                },
                {
                    $set: {
                        rating: overallrating,
                    },
                },
                (err, acknowledge) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        }
    );
    let entry = {
        username: req.session.username,
        product_id: req.body.product_id,
        stars: req.body.starvalue,
        feedbackdesc: req.body.feedbackdesc,
    };
    let feedback = new feedbackdetails(entry);
    feedback.save((err) => {
        if (err) {
            console.log(err);
        }
    });
    res.status(200).send({
        message: "done",
    });
});


app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        console.log("session destroyed");
    });
    res.status(200).send("session destroyed");
});

app.listen(port, () => {
    console.log("done \ngo and see at http://127.0.0.1:" + port);
});
