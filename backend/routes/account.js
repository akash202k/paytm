import Router from "express";
import { Account, User } from "../src/db.js";
import { auth } from "../src/middleware.js";
import { AMOUNT_TRANSFER } from "../src/zodSchema.js"
import mongoose from "mongoose";

const router = Router();

router.get('/health', (req, res) => {
    res.send("Account healt ok");
})

router.get('/balance', auth, async (req, res) => {

    const userAcc = await Account.findOne({ userId: req.userId })
    const balance = userAcc.balance;

    res.json({
        balance: balance
    })
})

router.post('/transfer', auth, async (req, res) => {
    const session = await mongoose.startSession();
    // starting transaction
    console.log("starting transaction ...");
    session.startTransaction();

    const { success, error } = AMOUNT_TRANSFER.safeParse(req.body);
    if (!success) {
        console.log(error.issues);
        res.json({
            error: error.issues
        })
        return;
    }

    const {recipientId, amount} = req.body;

    // authenticate recipient account 

    const isRecipientExist = await Account.findOne({ userId: recipientId }).session(session)
    if (!isRecipientExist) {
        res.status(403).json({
            message: "Invalid account"
        })
        return;
    }

    // check sender accout has sufficient balance 
    const senderAccount = await Account.findOne({ userId: req.userId }).session(session);
    if (senderAccount.balance < req.body.amount) {
        res.status(403).json({
            message: "Insufficient balance"
        })
        return;
    }

    // all check's are passed now tranfer the money to recipient
    // debit from sender account
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    
    // credit to recipient account 
    await Account.updateOne({userId: recipientId}, {$inc: {balance: amount}}).session(session);

    await session.commitTransaction();
    console.log("Transaction successful");

    res.status(200).json({
        message: "Transfer successful"
    })  





})
export default router