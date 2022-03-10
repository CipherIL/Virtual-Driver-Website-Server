import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

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
            return res.status(400).send({status:400,data:"Invalid User Data"});
        }
        if(!emailRegex.test(data.email)) {
            return res.status(400).send({status:400,data:"Invalid email"});
        }
        if(!passwordRegex.test(data.password)) {
            return res.status(400).send({status:400,data:"Invalid password"});
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
            status: 201,
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            }
        })
    } catch (err) {
        console.log(err);
        if(err.code && err.code === 11000) {
            return res.status(400).send({status:400,data:"Email already exists in the database"})
        }
        res.status(500).send({status:500,data:"Internal Server Error"});
    }
}

//This functions does the following:
// - Locate a user in the database
// - Create a token and save it as a cookie on the response
export const loginUser = async (req: express.Request,res: express.Response) => {
    const data: IUserLoginData = {...req.body};
    try {
        //Check valid email
        if(!emailRegex.test(data.email)) {
            return res.status(400).send({status:400,data:"Invalid email or password"});
        }
        //Find user with this email
        const user = await User.findOne({email:data.email.toLowerCase()});
        if(!user) {
            return res.status(400).send({status:400,data:"Invalid email or password"});
        }
        //Check valid password
        if(!bcrypt.compareSync(data.password,user.password)) {
            return res.status(400).send({status:400,data:"Invalid email or password"});
        } else {
            const token = new Token({
                token: jwt.sign({data:user.id},process.env.SECRET)
            });
            await token.save();
            res.cookie('AuthToken',token.token);
            res.status(200).send({
                status: 200,
                data: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                }
            })
        }
    } catch (err) {
        res.status(500).send({status:500,data:"Internal Server Error"});
    }
}

//This functions does the following:
// - Locates a token in the database
// - deletes the token and deletes the cookie on the response
export const logoutUser = async (req: express.Request,res: express.Response) => {
    const token = req.cookies.AuthToken;
    if(!token) {
        return res.status(404).send({status:404,data:"You have no token"});
    }
    try {
        const deletedToken = await Token.findOneAndDelete({token:token});
        res.clearCookie("AuthToken");
        if(deletedToken) return res.status(200).send({status:200,data:"Logged out succssesfully"});
        else return res.status(400).send({status:400,data:"Unauthorized"});
    } catch (err) {
        res.status(500).send({status:500,data:"Internal server error"});
    }
}

//This functions does the following:
// - Locates a token in the database
// - Returns user data by id from decrypted token
export const tokenRelogin = async (req: express.Request, res: express.Response) => {
    //Check token exists
    if(!req.cookies.AuthToken) {
        return res.status(404).send({status:404,data:"You have no token"});
    }
    try {
        //Check token exists in the database
        const token = await Token.findOne({token:req.cookies.AuthToken});
        if(!token) {
            res.clearCookie("AuthToken");
            return res.status(400).send({status:400,data:"Unauthorized"});
        }
        const data = jwt.verify(token.token,process.env.SECRET);
        if(typeof data !== "string") {
            const user = await User.findById(data.data);
            if(!user) {
                res.clearCookie("AuthToken");
                return res.status(400).send({status:400,data:"Unauthorized"});
            }
            res.status(200).send({
                status: 200,
                data: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                }
            })
        }
    } catch (err) {
        console.log(err)
    }
}