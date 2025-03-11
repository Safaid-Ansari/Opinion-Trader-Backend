const Joi = require("joi");

const signUpValidator = (req, res, next) => {
    const registerSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        role: Joi.string().optional().allow(null, '')
    });

    const { error } = registerSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: "Validation Error",
            errors: error.details.map((err) => err.message),
        });
    }

    next();
};

const loginValidator = (req, res, next) => {
    const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    const { error } = loginSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: "Validation Error",
            errors: error.details.map((err) => err.message),
        });
    }

    next();
};

module.exports = { signUpValidator, loginValidator };
