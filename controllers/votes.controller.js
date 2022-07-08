const dotenv = require('dotenv');
const mongoose = require("mongoose");
const { Vote, validateNewVote } = require("../models/Vote");

dotenv.config({});

class VoteController {
    async newVote(reqBody){
        const validation = validateNewVote(reqBody);
        if(validation.error){
            return {
                status: 400,
                success: false,
                message: validation.error.details[0].message.replace(/\"/ig, "")
            }
        }

        if(!mongoose.Types.ObjectId.isValid(reqBody.voter_id)) return {
            status: 400,
            success: false,
            message: "Invalid voter id. Not object id"
        }

        if(!mongoose.Types.ObjectId.isValid(reqBody.candidate_id)) return {
            status: 400,
            success: false,
            message: "Invalid candidate id. Not object id"
        }

        const existing = await Vote.findOne({voter: reqBody.voter_id});
        if(existing) return {
            status: 400,
            success: false,
            message: "Already voted"
        }

        const newVote = new Vote({voter: reqBody.voter_id, candidate: reqBody.candidate_id});
        return await newVote.save().then(doc=> {
            return {
                status: 201,
                success: true,
                vote: {...doc.toJSON()},
                message: "Voted successfully"
            }
        }).catch(e=> {
            return {
                status: 500,
                success: false,
                message: "Internal server error"
            }
        });
    }
}

module.exports = {
    VoteController
}