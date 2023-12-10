const User = require('./user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { jwtsecret } = require('../../config');
const { tryCatchWrapper } = require('../util');

const create = tryCatchWrapper(async (req, res) => {
    const { body } = req;
    const { username, password } = body;

    if (!password || !username) {
        res.status(400).json({ error: 'Username and password are required.' });
    }

    body.username = username.toLowerCase(); // enforce lowercase usernames on backend

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userDoc = new User({ ...body, password: hashedPassword });
        const user = await userDoc.save();
        const userObj = user.toObject();

        delete userObj.password;
        res.status(201).json({ data: userObj });
    } catch (error) {
        if (error.message !== `Username ${body.username} is already taken.`) {
            throw error;
        }
        res.status(409).json({ error: error.message });
    }
});

const show = tryCatchWrapper(async (req, res) => {
    const { id } = req.params;
    const { includes } = req.query;
    const queries = includes ? includes.split(',') : [];

    let userQuery = User.findOne({ _id: id });
    if(queries.includes('snippets')) { userQuery.populate('snippets') }
    if(queries.includes('bookmarks')) { userQuery.populate('bookmarks') }

    const user = await userQuery.exec();
    if(!user) { return res.status(404).json({ error: `User not found with id: ${id}` }); }
    
    const userObj = user.toObject();
    delete userObj.password;
    return res.status(200).json({ data: userObj });
});

const update = tryCatchWrapper(async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    try {
        // prevent user from updating password
        delete body.password;
        
        const user = await User.findOneAndUpdate({ _id: id }, body, { new: true });
        
        const userObj = user.toObject();
        delete userObj.password;
        res.status(200).json({ data: userObj });
    } catch (error) {
        if (error.message !== `Username ${body.username} is already taken.`) {
            throw error;
        }
        res.status(409).json({ error: error.message });
    }
});

const login = tryCatchWrapper(async (req, res) => {
    const { username, password } = req.body;

    if (!password || !username) {
        res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await User.findOne({ username: username.toLowerCase() })
    if (!user) { return res.status(404).json({ error: 'Invalid Credentials' }); }

    const authenticated = await bcrypt.compare(password, user.password);
    if (!authenticated) { return res.status(401).json({ error: 'Invalid Credentials' }); }

    const token = jwt.sign({ id: user._id, username: user.username }, jwtsecret, { expiresIn: '1d' });
    const userObj = user.toObject();
    delete userObj.password;
    res.header('Authorization', `Bearer ${token}`).status(200).json({ data: userObj });
});

module.exports = {
    create,
    show,
    update,
    login
};
