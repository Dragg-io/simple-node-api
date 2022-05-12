const { response } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const {customers} = require('./db.js');
const { getBalance } = require("./functions/getBalance.js");

const { veirifyIfExistsAccountCPF } = require('./middlewares/verifyIfExistsAccountCPF');

const app = express();
app.use(express.json());

app.post("/account", (req, res)=>{
  const {cpf, name} = req.body;
  const id = uuidv4();

  const customerAlredyExists = customers.some(customer=>customer.cpf === cpf);
  
  if(customerAlredyExists){
    return res.status(400).json({
      type: 'error',
      message:"Usuário já existe!"
    });
  }
  
  customers.push({
    cpf,
    name,
    id, 
    statement: []
  });

  return res.status(201).json({
    message:"Usuário adicionado"
  });
});

app.post("/deposit",veirifyIfExistsAccountCPF, (req, res)=>{
  const {description, amount} = req.body;
  const {customer} = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return res.status(201).send();
})

app.post("/withdraw",veirifyIfExistsAccountCPF, (req, res)=>{
 const {amount} = req.body;
 const {customer} = req;

 const balance = getBalance(customer.statement);
 
 if(balance < amount) return res.status(400).json({
     type: "error",
     message: "Saldo insuficiente"
 });

 const statementOperation = {
   amount,
   created_at: new Date(),
   type: "debit"
 }

 customer.statement.push(statementOperation);

 return res.status(201).send();
})

app.put("/account", veirifyIfExistsAccountCPF, (req, res)=>{
  const {customer} = req;
  const {name} = req.body;

  customer.name = name;

  return res.status(201).send();
});

app.get("/account", veirifyIfExistsAccountCPF, (req, res)=>{
  const {customer} = req;
  return res.status(200).json(customer);
});

app.get("/balance", veirifyIfExistsAccountCPF, (req, res)=>{
  const {customer} = req;
  const balance = getBalance(customer.statement);
  return res.status(200).json(balance);
});

app.get("/statement", veirifyIfExistsAccountCPF, (req, res)=>{
  const {customer} = req;
  return res.status(200).json(customer.statement);
});

app.get("/statement/date", veirifyIfExistsAccountCPF, (req, res)=>{
  const {customer} = req;
  const {date} = req.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter((operation) => operation.created_at.toDateString() === new Date(dateFormat).toDateString());

  return res.status(200).json(statement);
});

app.delete("/delete", veirifyIfExistsAccountCPF, (req, res)=>{
  const {customer} = req;

  customers.splice(customer, 1);

  return res.status(200).json(customers);
});

app.listen(3333)