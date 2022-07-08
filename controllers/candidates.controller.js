const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const Joi = require("joi");
const mongoose = require("mongoose");
const { Candidate, validateNewCandidate } = require("../models/Candidate");
const { Vote } = require("../models/Vote");

dotenv.config({});

class CandidateController {
    async createCandidate(reqBody){
        const validation = validateNewCandidate(reqBody);
        if(validation.error){
            return {
                status: 400,
                success: false,
                message: validation.error.details[0].message.replace(/\"/ig, "")
            }
        }

        const existing = await Candidate.findOne({national_id: reqBody.national_id});
        if(existing) return {
            status: 400,
            success: false,
            message: `Candidate with national ID ${reqBody.national_id} already exists`
        }

        const newCandidate = new Candidate({...reqBody});
        return await newCandidate.save().then(doc=> {
            return {
                status: 201,
                success: true,
                candidate: {...doc.toJSON()},
                message: "Candidate created"
            }
        }).catch(e=> {
            return {
                status: 500,
                success: false,
                message: "Internal server error"
            }
        });
    }

    async getCandidate(candidateId){
        const validation = Joi.string().min(10).max(40).required().validate(candidateId);
        if(validation.error) return {
            status: 400,
            success: false,
            message: validation.error.details[0].message.replace(/\"/ig, "")
        }

        if(!mongoose.Types.ObjectId.isValid(candidateId)) return {
            status: 400,
            success: false,
            message: "Inavlid candidate in. Not object id"
        }
        
        const candidate = await Candidate.findById(candidateId);
        if(!candidate) return {
            status: 404,
            success: false,
            message: "Candidate Not Found"
        }

        const votes =  await Vote.find({candidate: candidate._id}).count();

        return {
            status: 200,
            success: true,
            message: "Candidate found",
            candidate: {...candidate.toJSON(), password: null, votes: votes}
        }
    }

    async getAllCandidates(page=1, perPage=10){
        const results = await Candidate.paginate({}, {
            page: page,
            limit: perPage,
            lean: true,
            select: "_id firstName middleName lastName gender national_id mission_statement",
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
        }));

        if(!results.success) return results;

        for(let i=0; i<results.data.docs.length; i++){
            let votes = await Vote.find({candidate: results.data.docs[i]._id}).count();
            results.data.docs[i] = {...results.data.docs[i], votes: votes};
        }

        return results;
    }
}

module.exports = {
    CandidateController
}