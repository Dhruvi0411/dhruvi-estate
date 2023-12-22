import { errorHandler } from '../utils/error.js';
import User from './../models/user.model.js';
import bcrypt from 'bcrypt'

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
        next(errorHandler(550,'Data already Exits.....!'));
    }
}