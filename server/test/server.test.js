const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach((done) => populateUsers(done))
beforeEach((done) => populateTodos(done))

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
            
            Todo.findOne({_id: id})
            .then((todo) => {
                expect(todo.completed).toBe(true);
                expect(todo.text).toBe(text);
                expect(todo.completedAt).toBeTruthy();
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
            
            Todo.findOne({_id: id})
            .then((todo) => {
                expect(todo.text).toBe(text);
                expect(todo.completedAt).toBeFalsy();
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

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
          .get('/users/me')
          .set('x-auth', users[0].tokens[0].token)
          .expect(200)
          .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
          })
          .end(done);
      });

    it('should return 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', 'abc')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({});
        })
        .end(done)
    })
})

describe('POST /users', () => {
    it('should create user', (done) => {
        const email = 'example@example.com';
        const password = 'qwerty123';

        request(app)
        .post('/users')
        .send({
            email,
            password
        })
        .expect(200)
        .expect(res => {
            expect(res.headers['x-auth']).toBeTruthy();
            expect(res.body.email).toEqual(email);
            expect(res.body._id).toBeTruthy();
        })
        .end(done)
    })
})

describe('POST /users/login', () => {
    it('should login user', (done) => {

        request(app)
        .post('/users/login')
        .send({
            email: users[0].email,
            password: users[0].password
        })
        .expect(200)
        .expect(res => {
            expect(res.headers['x-auth']).toBeTruthy();
            expect(res.body.email).toBe(users[0].email);
            expect(res.body._id).toBeTruthy();
        })
        .end(done)
    })

    it('should reject login with invalid credentials', (done) => {
        const email = 'exam@example.com';
        const password = 'qwerty123';

        request(app)
        .post('/users/login')
        .send({
            email,
            password
        })
        .expect(400)
        .expect(res => {
            expect(res.body).toEqual({});
        })
        .end(done)
    })
})

describe('DELETE /users/me/token', () => {
    it('should logout user', (done) => {

        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[1].tokens[0].token)
        .expect(200)
        .expect(res => {
            expect(res.body.user.tokens.length).toBe(0);
        })
        .end(done)
    })

})