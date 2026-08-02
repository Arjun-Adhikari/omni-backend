import Customer from '../models/customer.model.js';
import CustomerIdentity from '../models/customer_identity.model.js';

export async function findCustomerById(id) {
  return Customer.findByPk(id);
}

export async function createCustomer(data) {
  return Customer.create(data);
}

export async function findIdentityByChannelAndProviderUserId(channelId, providerUserId) {
  return CustomerIdentity.findOne({
    where: { channelId, providerUserId },
    include: [{ model: Customer, as: 'customer' }],
  });
}

export async function createIdentity(data) {
  return CustomerIdentity.create(data);
}
