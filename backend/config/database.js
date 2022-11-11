const mongoose = require('mongoose');

const connectDatabase = () =>{
    
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true
    })
    .then(con => {
        console.log(`MongoDB Database connected with HOST : ${con.connection.host}`)
    })

    // const URI = process.env.MONGO_URL
    // console.log(URI)
    // mongoose.connect(URI,{
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //     // useFindAndModify: true,
    //     useCreateIndex: true,
    // },err=>{
    //     if(err) err;
    //     console.log("Connect to monggoDB")
    // })
}

module.exports = connectDatabase