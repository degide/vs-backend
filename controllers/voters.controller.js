const { hashSync, compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const Joi = require("joi");
const mongoose = require("mongoose");
const { Voter, validateNewVoter, validateVoterLogin } = require("../models/Voter");

dotenv.config({});

class VoterController {
    async createVoter(reqBody){
        const validation = validateNewVoter(reqBody);
        if(validation.error){
            return {
                status: 400,
                success: false,
                message: validation.error.details[0].message.replace(/\"/ig, "")
            }
        }

        const existing = await Voter.findOne({$or: [{email: reqBody.email}, {national_id: reqBody.national_id}]});
        if(existing?.email == reqBody.email) return {
            status: 400,
            success: false,
            message: "Email already taken"
        }

        if(existing?.national_id == reqBody.national_id) return {
            status: 400,
            success: false,
            message: `Voter with national ID ${reqBody.national_id} already exists`
        }

        const newVoter = new Voter({...reqBody, password: hashSync(reqBody.password, 10)});
        return await newVoter.save().then(doc=> {
            return {
                status: 201,
                success: true,
                voter: {...doc.toJSON(), password: null},
                message: "Voter created"
            }
        }).catch(e=> {
            return {
                status: 500,
                success: false,
                message: "Internal server error"
            }
        });
    }

    async voterLogin(reqBody){
        const validation = validateVoterLogin(reqBody);
        if(validation.error){
            return {
                status: 400,
                success: false,
                message: validation.error.details[0].message.replace(/\"/ig, "")
            }
        }

        const voter = await Voter.findOne({email: reqBody.email});
        if(!voter) return {
            status: 400,
            success: false,
            message: "Invalid email or password"
        }
        if(!compareSync(reqBody.password, voter.password)) return {
            status: 400,
            success: false,
            message: "Invalid email or password"
        }

        const token = jwt.sign({
            user_id: voter.toJSON()._id,
            issuer: "VS",
            user_type: "VOTER"
        }, process.env.JWT_SECRET);

        return {
            status: 200,
            success: true,
            message: "Logged in successfully",
            token: token
        }
    }

    async getVoter(voterId){
        const validation = Joi.string().min(10).max(40).required().validate(voterId);
        if(validation.error) return {
            status: 400,
            success: false,
            message: validation.error.details[0].message.replace(/\"/ig, "")
        }

        if(!mongoose.Types.ObjectId.isValid(voterId)) return {
            status: 400,
            success: false,
            message: "Invalid voter id. Not object id"
        }
        
        const voter = await Voter.findById(voterId);
        if(!voter) return {
            status: 404,
            success: false,
            message: "Voter Not Found"
        }

        return {
            status: 200,
            success: true,
            message: "Voter found",
            voter: {...voter.toJSON(), password: null}
        }
    }

    async getAllVoters(page=1, perPage=10){
        return await Voter.paginate({}, {
            page: page,
            limit: perPage,
            lean: true,
            select: "_id firstName middleName lastName phone national_id address email",
            sort: {createdAt: -1}
        }).then(result=> ({
            status: 200,
            success: true,
            message: `The ${perPage} records on page ${page}`,
            data: result
        })).catch(e=> ({
            status: 500,
            success: false,
            message: "Internal server error"
        }))
    }
}

module.exports = {
    VoterController
}