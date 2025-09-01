const crmController = require('../../controllers/crmController');
const Customer = require('../../models/Customer');
const Tag = require('../../models/Tag');
const VCard = require('../../models/Vcard');

jest.mock('../../models/Customer');
jest.mock('../../models/Tag');
jest.mock('../../models/Vcard');

describe('CRM Controller - updateCustomer', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: '1' },
      body: { name: 'John Doe', vcardId: '' },
      user: { id: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  it('should set vcardId to null when empty string provided', async () => {
    Customer.update.mockResolvedValue([1]);
    const updatedCustomer = { id: 1, name: 'John Doe', vcardId: null };
    Customer.findByPk.mockResolvedValue(updatedCustomer);

    await crmController.updateCustomer(req, res);

    expect(Customer.update).toHaveBeenCalledWith(
      { name: 'John Doe', vcardId: null },
      { where: { id: '1', userId: 1 } }
    );
    expect(res.json).toHaveBeenCalledWith(updatedCustomer);
  });
});
