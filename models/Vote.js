const mongoose = require("mongoose");
const Joi = require("joi");
const paginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
    voter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voter"
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate"
    }
},{
    timestamps: true
});

const validateNewVote = (data)=> {
    const joi_schema = Joi.object({
        voter_id: Joi.string().min(10).max(40).required(),
        candidate_id: Joi.string().min(10).max(40).required()
    });

    return joi_schema.validate(data);
}

schema.plugin(paginate);

const Vote = mongoose.model("Vote", schema, "votes");

module.exports = {
    Vote,
    validateNewVote
}