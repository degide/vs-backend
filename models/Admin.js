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
    phone: {
        type: String,
        required: true,
    },
    national_id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const validateNewAdmin = (data)=> {
    const joi_schema = Joi.object({
        firstName: Joi.string().min(3).max(40).required(),
        middleName: Joi.string().min(3).max(40).optional(), 
        lastName: Joi.string().min(3).max(40).required(),
        phone: Joi.string().min(10).max(13).required(),
        national_id: Joi.string().min(16).max(16).required(),
        email: Joi.string().email().max(40).required(),
        password: Joi.string().min(6).max(80).required()
    });

    return joi_schema.validate(data);
}

const validateAdminLogin = (data)=> {
    const objectSchema = Joi.object({
        email: Joi.string().min(6).max(40).required(),
        password: Joi.string().min(6).max(80).required()
    });

    return objectSchema.validate(data);
}

schema.plugin(paginate);

const Admin = mongoose.model("Admin", schema, "admins");

module.exports = {
    Admin,
    validateNewAdmin,
    validateAdminLogin
}