const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({});

const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization || authorization.split(" ")[0] !== "Bearer")
        return res.status(401).send({ success: false, message: "unauthorized" });
    const token = authorization.split(" ")[1];
    if(!token) return res.status(401).send({ success: false, message: "unauthorized" });

    let decoded;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(e){
        return res.status(401).send({ success: false, message: "unauthorized" });
    }
    
    if(!decoded?.user_id && decoded?.issuer != "VS")
        return res.status(401).send({ success: false, message: "unauthorized" });

    req.user = decoded;
    return next()
}

const isAdminMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization || authorization.split(" ")[0] !== "Bearer")
        return res.status(401).send({ success: false, message: "unauthorized" });
    const token = authorization.split(" ")[1];
    if(!token) return res.status(401).send({ success: false, message: "unauthorized" });

    let decoded;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(e){
        return res.status(401).send({ success: false, message: "unauthorized" });
    }
    
    if(!decoded?.user_id || decoded?.issuer != "VS" || decoded?.user_type != "ADMIN")
        return res.status(401).send({ success: false, message: "Forbidden. Only admins are allowed to perform this action" });

    req.user = decoded;
    return next()
}

const isVoterMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization || authorization.split(" ")[0] !== "Bearer")
        return res.status(401).send({ success: false, message: "unauthorized" });
    const token = authorization.split(" ")[1];
    if(!token) return res.status(401).send({ success: false, message: "unauthorized" });

    let decoded;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(e){
        return res.status(401).send({ success: false, message: "unauthorized" });
    }
    
    if(!decoded?.user_id || decoded?.issuer != "VS" || decoded?.user_type != "VOTER")
        return res.status(401).send({ success: false, message: "Forbidden. Only voters are allowed to perform this action" });

    req.user = decoded;
    return next()
}

module.exports = {
    authMiddleware,
    isAdminMiddleware,
    isVoterMiddleware
}