//using Joi library for schema description and data validation
const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    role: Joi.string().valid('client', 'agent', 'admin').required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const conversationSchema = Joi.object({
    participants: Joi.array().items(Joi.string().length(24)).min(2).required()
    // Each participant must be a valid MongoDB ObjectId string (length 24)
});

const messageSchema = Joi.object({
    conversation: Joi.string().length(24).required(),
    //sender: Joi.string().length(24).required(),    // MongoDB ObjectId string
    content: Joi.string().min(1).max(2000).required()
});

const slotSchema = Joi.object({
    start: Joi.string()
        .isoDate()
        .required(), // Expects ISO8601 date-time string
    end: Joi.string()
        .isoDate()
        .required(), // Expects ISO8601 date-time string
    timezone: Joi.string().default('Asia/Kolkata')
});

const slotsArraySchema = Joi.object({
    slots: Joi.array().items(slotSchema).min(1).required()
});

module.exports = {
    registerSchema,
    loginSchema,
    conversationSchema,
    messageSchema,
    slotSchema,
    slotsArraySchema,
};
