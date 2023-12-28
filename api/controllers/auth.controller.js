import { errorHandler } from '../utils/error.js';
import User from './../models/user.model.js';
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    // console.log(req.body);
    const { username, email, password } = req.body;

    const hashpassword = await bcrypt.hash(password, 10)

    try {
        const newUser = new User({ username, email, password: hashpassword })
        await newUser.save();

        res.status(201).json('user Create Successfully....!')
    } catch (error) {
        // next(error);
        next(errorHandler(550, 'Data already Exits.....!'));
    }
}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const ValidUser = await User.findOne({ email });
        if (!ValidUser) {
            return next(errorHandler(404, 'User not found!'))
        }
        const ValidPassword = bcrypt.compareSync(password, ValidUser.password)
        if (!ValidPassword) {
            return next(errorHandler(401, 'Wrong Password!'))
        }

        const token = Jwt.sign({ id: ValidUser._id }, process.env.JWT_SECRET);
        res.cookie('access_token', token, { httpOnly: true }).status(200).json(ValidUser)
    } catch (error) {
        next(error)
    }
}

export const google = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;

            res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

            const newUser = new User({ username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4), email: req.body.email, password: hashedPassword, avatar: req.body.photo })

            await newUser.save();

            const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;

            res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);

        }
    } catch (error) {
        next(error);
    }
}