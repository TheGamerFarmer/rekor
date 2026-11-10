const { Schema, model } = require('mongoose');

const bankOperationSchema = new Schema(
  {
    amount: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { collection: 'bank_operation', versionKey: false },
);

module.exports = model('BankOperation', bankOperationSchema);
