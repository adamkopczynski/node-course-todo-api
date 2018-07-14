const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'adamkopc@gmail.com',
    password: 'qwerty123',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
},
{
    _id: userTwoId,
    email: 'akadamx@gmail.com',
    password: 'qwerty123',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId.toHexString(), access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}]

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId
},
{
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: false,
    completedAt: null,
    _creator: userOneId
}]

const populateUsers = (done) => {
    User.remove({}).then(() => {
        const userOne = new User(users[0]).save();
        const userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
    })
    .then(() => done())
    .catch(e => console.log(e));
}

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    })
    .then(() => done())
    .catch(e => console.log(e));
}

module.exports = {todos, populateTodos, users, populateUsers}