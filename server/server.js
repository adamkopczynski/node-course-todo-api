const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    })

    todo.save().then((doc) => {
        res.send(doc)
    })
    .catch((e) => {
        res.status(400).send(e)
    })
})

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos})
    })
    .catch((e) => res.status(400).send(e))
})

app.get('/todos/:id', (req,res) => {
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

app.delete('/todos/:id', (req,res) => {
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

app.patch('/todos/:id', (req, res) => {
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

app.listen(port, () => {
    console.log(`API started on port ${port}`)
})

module.exports = {app}
