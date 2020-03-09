// This is not a real datastore, but it can be if you make it one :)

let messages = {}
let users = {}
let me = undefined
let defaultChannel = undefined
let orders = [];
let makingTea = false;

exports.setMakingTea = (status) => {
  makingTea = status;
}

exports.getMakingTea = () => {
  return makingTea;
}

exports.getMessages = () => {
  return messages
}

exports.addToOrders = async (order) => {
  orders.push(order);  
}

exports.getOrders = async () => {
  return orders
}

exports.resetOrders = async () => {
  orders = [];
}

exports.addUser = (user) => {
  users[user.user] = user
}

exports.getUser = (id) => {
  return users[id]
}

exports.setChannel = (channel) => {
  defaultChannel = channel
}

exports.getChannel = () => {
  return defaultChannel
}

exports.setMe= (id) => {
  me = id
}

exports.getMe= () => {
  return me
}

