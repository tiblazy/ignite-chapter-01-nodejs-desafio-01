const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const usernameExists = users.find((user) => user.username.match(username));

  if (!usernameExists) {
    return response.status(404).json({ error: "Not Found" });
  }

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const id = uuidv4();

  const findUser = users.find(user => user.username.match(username))

  if(findUser){
    return response.status(400).json({error: "Username already exists"})
  }

  const user = {
    id,
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const { todos } = users.find((user) => user.username.match(username));

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const id = uuidv4();

  const created_at = new Date();

  const todo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at,
  };

  const user = users.find((user) => user.username.match(username));

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const todo = {
    title,
    deadline: new Date(deadline),
  };

  const user = users.find((user) => user.username.match(username));
  const todos = user.todos.find((todo) => todo.id === id);
  
  if (!todos) {
    return response.status(404).json({ error: "Not Found" });
  }

  const todoUpdate = Object.assign(todos, todo);

  return response.json(todoUpdate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find((user) => user.username.match(username));
  const todos = user.todos.find((todo) => todo.id === id);

  if (!todos) {
    return response.status(404).json({ error: "Not Found" });
  }

  todos.done = true;

  return response.json(todos);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find((user) => user.username.match(username));

  const findTodo = user.todos.find(todo => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: "Not Found" });
  }

  const todos = user.todos.filter((todo) => todo.id !== id);

  user.todos = todos;

  return response.status(204).json();
});

module.exports = app;
