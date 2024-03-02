require('dotenv').config()
const LoginRouter = require('./routers/login')
const express = require('express')
const app = express()
const cors = require('cors')
const serverless = require('serverless-http');
const SignUpRouter = require('./routers/signup')

//const mongoUrl = process.env.MONGO_URL
//mongoose.connect(mongoUrl)

// app.use(express.static('build'))
app.use(cors())
app.use(express.json());
app.get("/hello", (req, res) => {
  res.send("hello Wordl");
});
app.use('/credentials/login',LoginRouter)
app.use('/credentials/signup',SignUpRouter)

// const PORT = process.env.PORT || 3003

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })

module.exports.handler = serverless(app);