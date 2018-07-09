const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');


const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
},
{
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: false,
    completedAt: null
}]

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    })
    .then(() => done());
})

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Test todo text';

        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if(err){
                return done(err)
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(3);
                expect(todos[2].text).toBe(text);
                done();
            })
            .catch((err) => done(err))
        })
    })

    it('should not create todo with invalid data', (done) => {

        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if(err){
                return done(err)
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            })
            .catch((err) => done(err))
        })
    })
})

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done)
    })
})

describe('GET /todos/:id', () => {
    it('should get todo with id', (done) => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done)
    })

    it('should return 404 if todo not found', (done) => {
        request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done)
    })

    it('should return 404 for non-object ids', (done) => {
        request(app)
        .get(`/todos/123`)
        .expect(404)
        .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('should complete todo and update text', (done) => {
        const id = todos[0]._id.toHexString();
        const text = 'Updated text';

        request(app)
        .patch(`/todos/${id}`)
        .send({completed: true, text})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
        })
        .end((err, res) => {
            if(err) return done(err);
            
            Todo.findOne({id})
            .then((todo) => {
                expect(todo.completed).toBe(true);
                expect(todo.text).toBe(text);
                expect(todoCompletedAt).toBeA('number');
                done();
            })
            .catch((e) => done(e))
        })
    })

    it('should clear completedAt when todo is not completed', (done) => {
        const id = todos[0]._id.toHexString();
        const text = 'Updated text';

        request(app)
        .patch(`/todos/${id}`)
        .send({completed: false, text})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
        })
        .end((err, res) => {
            if(err) return done(err);
            
            Todo.findOne({id})
            .then((todo) => {
                expect(todo.text).toBe(text);
                expect(todoCompletedAt).toBeFalsy();
                done();
            })
            .catch((e) => done(e))
        })
    })

    it('should return 404 if todo not found', (done) => {
        request(app)
        .patch(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done)
    })

    it('should return 404 for non-object ids', (done) => {
        request(app)
        .patch(`/todos/123`)
        .expect(404)
        .end(done)
    })
})

describe('DELETE /todos/:id', () => {
    it('should delete todo with id', (done) => {
        const id = todos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end((err, res) => {
            if(err) return done(err);
            
            Todo.findOne({id})
            .then((todo) => {
                expect(todo).toBeFalsy();
                done();
            })
            .catch((e) => done(e))
        })
    })

    it('should return 404 if todo not found', (done) => {
        request(app)
        .delete(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done)
    })

    it('should return 404 for non-object ids', (done) => {
        request(app)
        .delete(`/todos/123`)
        .expect(404)
        .end(done)
    })
})