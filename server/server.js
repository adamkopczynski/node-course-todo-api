require('./config/config');

const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate')

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    const todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    })

    todo.save().then((doc) => {
        res.send(doc)
    })
    .catch((e) => {
        res.status(400).send(e)
    })
})

app.get('/todos',authenticate,  (req, res) => {
    Todo.find({_creator: req.user._id}).then((todos) => {
        res.send({todos})
    })
    .catch((e) => res.status(400).send(e))
})

app.get('/todos/:id', authenticate, (req,res) => {
    const id = req.params.id;

    if(ObjectID.isValid(id)){
        Todo.findById(id).then((todo) => {
            if(todo) res.send({todo});
            else res.status(404).send();
        })
        .catch(err => res.status(400).send(err));
    }
    else{
        res.status(404).send();
    }
    
})

app.delete('/todos/:id',authenticate, (req,res) => {
    const id = req.params.id;

    if(ObjectID.isValid(id)){
        Todo.findByIdAndRemove(id).then((todo) => {
            if(todo) res.send({todo});
            else res.status(404).send();
        })
        .catch(err => res.status(400).send(err));
    }
    else{
        res.status(404).send();
    }
    
})

app.patch('/todos/:id',authenticate, (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);

    if(ObjectID.isValid(id)){
        if(_.isBoolean(body.completed) && body.completed){
            body.completedAt = new Date().getTime();
        }
        else{
            body.completed = false;
            body.completedAt = null;
        }

        Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
            if(todo){
                res.send({todo});
            }
            else res.status(404).send();
        })
        .catch(e => res.status(400).send())
    }
    else{
        res.status(404).send();
    }
})

//Users

app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    const user = new User(body)

    user.save().then((user) => {
        return user.generateAuthToken()
    })
    .then((token) => {
        res.header('x-auth', token).send(user);
    })
    .catch((e) => res.status(400).send(e))
})

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
})

app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
    .then(user => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    })
    .catch(e => {
        res.status(400).send()
    })
})

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then((user) => {
        res.send(user);
    })
    .catch(e => {
        res.status(400).send();
    })
})

app.listen(port, () => {
    console.log(`API started on port ${port}`)
})

module.exports = {app}
