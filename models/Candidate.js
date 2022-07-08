const mongoose = require("mongoose");
const Joi = require("joi");
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
        default: null
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
    },
    national_id: {
        type: String,
        required: true
    },
    mission_statement: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const validateNewCandidate = (data)=> {
    const joi_schema = Joi.object({
        firstName: Joi.string().min(3).max(40).required(),
        middleName: Joi.string().min(3).max(40).optional(), 
        lastName: Joi.string().min(3).max(40).required(),
        gender: Joi.string().min(3).max(13).allow("Male","Female").required(),
        national_id: Joi.string().min(16).max(16).required(),
        mission_statement: Joi.string().min(3).max(500).required()
    });

    return joi_schema.validate(data);
}

schema.plugin(paginate);

const Candidate = mongoose.model("Candidate", schema, "candidates");

module.exports = {
    Candidate,
    validateNewCandidate
}