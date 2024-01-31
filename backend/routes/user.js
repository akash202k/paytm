import { Router } from "express";
import { USER_SIGNUP, USER_SIGNIN, USER_UPDATE } from '../src/zodSchema.js'
import secret from '../src/config.js'
import { z } from "zod";
import { Account, User } from "../src/db.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { auth } from "../src/middleware.js";


const router = Router();

router.get('/health', (req, res) => {
    res.send("Health Ok !")
})

router.post('/signup', async (req, res) => {
    const { username, firstName, lastName, password } = req.body;


    const isValid = USER_SIGNUP.safeParse(req.body);

    if (!isValid.success) {
        res.json({
            error: isValid.error.issues
        })
        return;
    }

    // check is USER_SIGNUP alredy exist in db
    const isUserExist = await User.findOne({ username });
    console.log(isUserExist);

    if (isUserExist) {
        res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
        return;
    }

    //add data to db and send back userid as responce 
    const newUser = await User.create({
        username,
        firstName,
        lastName,
        password
    })

    const userId = newUser._id;
    // const userData = await User.findOne({username})
    // const userId = userData._id;
    // console.log(userId);

    // credit balance in user account 

    await Account.create({
        userId,
        balance: (1 + Math.random() * 1000)
    })

    const token = jwt.sign({ userId }, secret);

    res.status(200).json({
        message: "User created successfully",
        Token: `Bearer ${token}`
    })


})

router.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    const userDetails = {
        username: username,
        password: password
    }
    const isValid = USER_SIGNIN.safeParse(userDetails);
    if (!isValid.success) {
        console.log("Input Validation Failed");
        res.json({
            error: isValid.error.issues
        })
    }

    // check is use exist in db
    const isUserExist = await User.findOne({ username });
    if (!isUserExist) {
        console.log("User not exist , login failed");
        res.status(401).json({
            error: 'User not exist, register first'
        })
        return;
    }

    // if user exist create jwt and send it in response

    const userId = isUserExist._id;
    const token = jwt.sign({ userId }, secret);

    res.status(200).json({
        Token: `Bearer ${token}`
    })
})

router.put('/', auth, async (req, res) => {
    // console.log("called put")
    const { success, error } = USER_UPDATE.safeParse(req.body);
    if (!success) {
        console.log(error.issues);
        res.json({
            error: error.issues
        })
        return;
    }

    await User.updateOne({ _id: req.userId }, { $set: req.body });

    res.json({
        message: "Updated successfully"
    })

})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter,
                "$options": "i"
            }
        }, {
            lastName: {
                "$regex": filter,
                "$options": "i"
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})



export default router;