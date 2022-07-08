const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const swaggerJSDOC = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const { connectDB } = require("./db");
const { adminsRouter } = require("./routes/admin.routes");
const { candidatesRouter } = require("./routes/candidate.routes");
const { votesRouter } = require("./routes/vote.routes");
const { votersRouter } = require("./routes/voter.routes");

const PORT = process.env.PORT || 4000;

const server = express();
server.use(cors({
    origin: "*"
}));
server.use(helmet({}));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

connectDB();

const swaggerConfig = swaggerJSDOC({
    definition: {
        openapi: '3.0.0',
        info: {
            title: "VOTING SYSTEM API",
            description: "APIs specification documentation for voting system",
            version: "1.0.0",
            contact: {
                name: "Harerimana Egide",
                email: "egideharerimana085@gmail.com",
                url: "https://egide.netlify.com"
            }
        },
        basePath: "/",
        servers: [
            {
                url: "http://localhost:{port}/{basePath}",
                description: "The development API server",
                variables: {
                    port: {
                        enum: ["4000"],
                        default: "4000"
                    },
                    basePath: {
                        enum: [""],
                        default: ""
                    }
                }
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: []
    },
    apis: ["./swagger/**/*.yaml"]
});

server.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerConfig));
server.use("/admins", adminsRouter);
server.use("/candidates", candidatesRouter);
server.use("/votes", votesRouter);
server.use("/voters", votersRouter);



server.listen(PORT, () => {
    console.log(`Server started at: http://localhost:${PORT}`)
});
