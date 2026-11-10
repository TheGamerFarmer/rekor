const { Schema, model } = require('mongoose');

const bankOperationDocumentSchema = new Schema(
  {
    document: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    bankOperation: { type: Schema.Types.ObjectId, ref: 'BankOperation', required: true },
  },
  { collection: 'bank_operation_document', versionKey: false },
);

bankOperationDocumentSchema.index({ document: 1, bankOperation: 1 }, { unique: true });

module.exports = model('BankOperationDocument', bankOperationDocumentSchema);
