import mongoose from "mongoose";


const connectionString = "mongodb+srv://akash:DVJ4k8fSb0qey3oe@akash-play.zay1bq8.mongodb.net/paytm"
mongoose.connect(connectionString).then(console.log("connected to db."));

const userSchema = mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    password: String
})

const User = mongoose.model('User', userSchema)

const accountSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const Account = mongoose.model('Account', accountSchema);


export { User, Account };