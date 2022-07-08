const express = require("express");
const { CandidateController } = require("../controllers/candidates.controller");
const { isAdminMiddleware, authMiddleware } = require("../middlewares/auth.middleware");

const candidatesRouter = express.Router();
const controller = new CandidateController();

candidatesRouter.post("", isAdminMiddleware, async (req, res)=> {
    const result = await controller.createCandidate(req.body);
    return res.status(result.status).send(result);
});

candidatesRouter.get("/:candidateId", authMiddleware, async (req, res)=> {
    const result = await controller.getCandidate(req.params.candidateId);
    return res.status(result.status).send(result);
});

candidatesRouter.get("", authMiddleware, async (req, res)=> {
    const result = await controller.getAllCandidates(
        parseInt(req.query.page || 1), parseInt(req.query.perPage || 10)
    );
    return res.status(result.status).send(result);
});

module.exports = {
    candidatesRouter
}