const express = require('express');
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

app.listen(port, () => {
    console.log(`API started on port ${port}`)
})

module.exports = {app}
