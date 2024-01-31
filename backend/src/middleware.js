import jwt from "jsonwebtoken"
import secret from "./config.js"


export function auth(req, res, next) {
    // console.log('Request Headers:', req.headers);

    const { authorization} = req.headers;
    // console.log(authorization)

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(403).json({error: "Access Denied"});
    }

    const token = authorization.split(' ')[1];
    // console.log(token)
    
    try {
        const decode = jwt.verify(token, secret);

    console.log(decode.userId);
    if(!decode.userId){
        res.status(411).json({
            error: "unAuthorized user"
        })
        return;
    }

    req.userId = decode.userId;
    next();
    } catch (error) {
        console.log(error)
        res.json({
            error
        })
    }
}
