const mongoose = require('mongoose');

const fields = {
    username: { type: String, required: true },
    years_experience: { type: Number, default: 0 },
    programming_languages: { type: [String], default: [] },
    password: { type: String },
};

const schemaOptions = {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
};

const UserSchema = new mongoose.Schema(fields, schemaOptions);

UserSchema.pre('save', async function (next) {
    try {
        const existingUser = await User.findOne({ username: new RegExp(this.username, 'i')})
        if (existingUser) {
            const error = new Error(`Username ${this.username} is already taken.`);
            return next(error);
        }
    } catch (error) {
        return next(error);
    }
});

UserSchema.pre('findOneAndUpdate', async function (next) {
    const { _id } = this.getQuery();
    const { username } = this.getUpdate();

    if (username) { 
        const existingUser = await User.findOne({ username: new RegExp(username, 'i') });
        if (existingUser && existingUser._id.toString() !== _id) {
            const error = new Error(`Username ${username} is already taken.`);
            return next(error);
        }
    }

    next();
});

UserSchema.virtual('snippets', {
    ref: 'Snippet',
    localField: '_id',
    foreignField: 'user_id'
});

UserSchema.virtual('bookmarks', {
    ref: 'Bookmark',
    localField: '_id',
    foreignField: 'user_id'
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
