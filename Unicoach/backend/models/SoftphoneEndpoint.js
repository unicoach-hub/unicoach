const mongoose = require('mongoose');

// A Vobiz SIP endpoint for one admin-panel user, so they can call from the browser softphone.
// owner is "admin:<userId>" for the account owner or "staff:<staffId>" for a team member.
const softphoneEndpointSchema = new mongoose.Schema({
  owner: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  endpointId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SoftphoneEndpoint', softphoneEndpointSchema);
