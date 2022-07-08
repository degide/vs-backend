const res = require("express/lib/response");
const { hashSync, compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const Joi = require("joi");
const mongoose = require("mongoose");
const { Admin, validateNewAdmin, validateAdminLogin } = require("../models/Admin");

dotenv.config({});

class AdminController {
    async createAdmin(reqBody){
        const validation = validateNewAdmin(reqBody);
        if(validation.error){
            return {
                status: 400,
                success: false,
                message: validation.error.details[0].message.replace(/\"/ig, "")
            }
        }

        const existing = await Admin.findOne({$or: [{email: reqBody.email}, {national_id: reqBody.national_id}]});
        if(existing?.email == reqBody.email) return {
            status: 400,
            success: false,
            message: "Email already taken"
        }

        if(existing?.national_id == reqBody.national_id) return {
            status: 400,
            success: false,
            message: `Admin with national ID ${reqBody.national_id} already exists`
        }

        const newAdmin = new Admin({...reqBody, password: hashSync(reqBody.password, 10)});
        return await newAdmin.save().then(doc=> {
            return {
                status: 201,
                success: true,
                admin: {...doc.toJSON(), password: null},
                message: "Account created"
            }
        }).catch(e=> {
            return {
                status: 500,
                success: false,
                message: "Internal server error"
            }
        });
    }

    async adminLogin(reqBody){
        const validation = validateAdminLogin(reqBody);
        if(validation.error){
            return {
                status: 400,
                success: false,
                message: validation.error.details[0].message.replace(/\"/ig, "")
            }
        }

        const admin = await Admin.findOne({email: reqBody.email});
        if(!admin) return {
            status: 400,
            success: false,
            message: "Invalid email or password"
        }
        if(!compareSync(reqBody.password, admin.password)) return {
            status: 400,
            success: false,
            message: "Invalid email or password"
        }

        const token = jwt.sign({
            user_id: admin.toJSON()._id,
            issuer: "VS",
            user_type: "ADMIN"
        }, process.env.JWT_SECRET);

        return {
            status: 200,
            success: true,
            message: "Logged in successfully",
            token: token
        }
    }

    async getAdmin(adminId){
        const validation = Joi.string().min(10).max(40).required().validate(adminId);
        if(validation.error) return {
            status: 400,
            success: false,
            message: validation.error.details[0].message.replace(/\"/ig, "")
        }

        if(!mongoose.Types.ObjectId.isValid(adminId)) return {
            status: 400,
            success: false,
            message: "Inavlid admin in. Not object id"
        }
        
        const admin = await Admin.findById(adminId);
        if(!admin) return {
            status: 404,
            success: false,
            message: "Admin Not Found"
        }

        return {
            status: 200,
            success: true,
            message: "Admin found",
            admin: {...admin.toJSON(), password: null}
        }
    }

    async getAllAdmins(page=1, perPage=10){
        return await Admin.paginate({}, {
            page: page,
            limit: perPage,
            lean: true,
            select: "_id firstName middleName lastName phone national_id email",
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
    AdminController
}