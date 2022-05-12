const {customers} = require('./../db.js');

function veirifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers;
  const customer = customers.find(customer => customer.cpf === cpf);
  if(!customer) {
    return res.status(400).json({
      type: 'error',
      message: 'Cliente não encontrado'
    })
  }

  req.customer = customer;

  return next();
}

module.exports = {veirifyIfExistsAccountCPF};