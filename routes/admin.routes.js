const express = require("express");
const { AdminController } = require("../controllers/admins.controller");
const { isAdminMiddleware } = require("../middlewares/auth.middleware");

const adminsRouter = express.Router();
const controller = new AdminController();

adminsRouter.post("", async (req, res)=> {
    const result = await controller.createAdmin(req.body);
    return res.status(result.status).send(result);
});

adminsRouter.post("/login", async (req, res)=> {
    const result = await controller.adminLogin(req.body);
    return res.status(result.status).send(result);
});

adminsRouter.get("/:adminId", isAdminMiddleware, async (req, res)=> {
    const result = await controller.getAdmin(req.params.adminId);
    return res.status(result.status).send(result);
});

adminsRouter.get("", isAdminMiddleware, async (req, res)=> {
    const result = await controller.getAllAdmins(
        parseInt(req.query.page || 1), parseInt(req.query.perPage || 10)
    );
    return res.status(result.status).send(result);
});

module.exports = {
    adminsRouter
}