// Middleware: takes any Joi/Yup/etc schema and validates req.body

module.exports = (schema: any) => (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
};