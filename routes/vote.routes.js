const express = require("express");
const { VoteController } = require("../controllers/votes.controller");
const { isVoterMiddleware } = require("../middlewares/auth.middleware");

const votesRouter = express.Router();
const controller = new VoteController();

votesRouter.post("", isVoterMiddleware, async (req, res)=> {
    const result = await controller.newVote(req.body);
    return res.status(result.status).send(result);
});

module.exports = {
    votesRouter
}