const mongoose = require('mongoose');

const { username, password, projectname } = require('../config');
const mongoURL = `mongodb+srv://${username}:${password}@cluster0.nuld0m6.mongodb.net/${projectname}?retryWrites=true&w=majority`;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURL);
        console.log('Succesfuly connection to Mongo DB');
    } catch (error) {
        console.log(error);
        process.exit();
    }
}

module.exports = { connectDB };
