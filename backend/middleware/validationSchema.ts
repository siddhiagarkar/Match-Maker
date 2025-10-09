//using Joi library for schema description and data validation
const Joi = require('joi');

exports.registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    role: Joi.string().valid('client', 'agent', 'admin').required()
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

exports.conversationSchema = Joi.object({
    participants: Joi.array().items(Joi.string().length(24)).min(2).required()
    // Each participant must be a valid MongoDB ObjectId string (length 24)
});

exports.messageSchema = Joi.object({
    conversation: Joi.string().length(24).required(),
    //sender: Joi.string().length(24).required(),    // MongoDB ObjectId string
    content: Joi.string().min(1).max(2000).required()
});
