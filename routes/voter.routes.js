const express = require("express");
const { VoterController } = require("../controllers/voters.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const votersRouter = express.Router();
const controller = new VoterController();

votersRouter.post("", async (req, res)=> {
    const result = await controller.createVoter(req.body);
    return res.status(result.status).send(result);
});

votersRouter.post("/login", async (req, res)=> {
    const result = await controller.voterLogin(req.body);
    return res.status(result.status).send(result);
});

votersRouter.get("/:voterId", authMiddleware, async (req, res)=> {
    const result = await controller.getVoter(req.params.voterId);
    return res.status(result.status).send(result);
});

votersRouter.get("", authMiddleware, async (req, res)=> {
    const result = await controller.getAllVoters(
        parseInt(req.query.page || 1), parseInt(req.query.perPage || 10)
    );
    return res.status(result.status).send(result);
});

module.exports = {
    votersRouter
}