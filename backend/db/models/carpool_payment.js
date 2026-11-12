const { Schema, model } = require('mongoose');

const carpoolPaymentSchema = new Schema(
  {
    carpool: { type: Schema.Types.ObjectId, ref: 'Carpool', required: true },
    amount: { type: Number, required: true },
  },
  { collection: 'carpool_payment', versionKey: false },
);

module.exports = model('CarpoolPayment', carpoolPaymentSchema);
