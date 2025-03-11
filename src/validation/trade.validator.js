const Joi = require("joi");

const placeTradeValidator = (req, res, next) => {
    const placeTradeValidatorSchema = Joi.object({
        eventId: Joi.string().required(),
        betAmount: Joi.number().required(),
        selectedOutcome: Joi.string().required(),
    });

    const { error } = placeTradeValidatorSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: "Validation Error",
            errors: error.details.map((err) => err.message),
        });
    }

    next();
};

const settleTradeValidator = (req, res, next) => {
    const settleTradeValidatorSchema = Joi.object({
        eventId: Joi.string().required(),
        outcome: Joi.string().required(),
    });

    const { error } = settleTradeValidatorSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: "Validation Error",
            errors: error.details.map((err) => err.message),
        });
    }

    next();
};

module.exports = { placeTradeValidator, settleTradeValidator }