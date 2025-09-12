const authRouter = require("./auth")

function routes(app) {
   app.use("/auth", authRouter)
}

module.exports = routes