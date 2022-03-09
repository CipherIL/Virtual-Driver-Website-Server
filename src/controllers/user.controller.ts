import * as express from 'express';
import * as jwt from 'jsonwebtoken';

//Model Import
import User from '../models/user.model';
import Token from '../models/token.model';

//Interfaces
interface IUserRegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface IUserLoginData {
    email: string;
    password: string;
}

//Regex
const emailRegex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);


//This functions does the following:
// - Register a user to the database
// - Create a token and save it as a cookie on the response
export const registerUser = async (req: express.Request,res: express.Response) => {
    const data:IUserRegisterData = {...req.body};
    try {
        //Data Validation
        if(!data.firstName || !data.lastName || !data.email || !data.password) {
            return res.status(400).send({status:400,message:"Invalid User Data"});
        }
        if(!emailRegex.test(data.email)) {
            return res.status(400).send({status:400,message:"Invalid email"});
        }
        if(!passwordRegex.test(data.password)) {
            return res.status(400).send({status:400,message:"Invalid password"});
        }
        data.email = data.email.toLowerCase();
        //Create the user
        const user = new User({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
        });
        //Create a token
        const token = new Token({
            token: jwt.sign({data:user.id},process.env.SECRET)
        });
        //Save user to database
        await user.save();
        //Save token to database
        await token.save();
        res.cookie('AuthToken',token.token);
        res.status(201).send({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        })
    } catch (err) {
        console.log(err);
        if(err.code && err.code === 11000) {
            return res.status(400).send({status:400,message:"Email already exists in the database"})
        }
        res.status(500).send({status:500,message:"Internal Server Error"});
    }
}


//This functions does the following:
// - Locate a user in the database
// - Create a token and save it as a cookie on the response
export const loginUser = async (req: express.Request,res: express.Response) => {
    //TODO: create this function to enable client side login
}

export const logoutUser = async (req: express.Request,res: express.Response) => {

}