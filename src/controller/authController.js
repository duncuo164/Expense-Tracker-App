import pool from "../db/dbConnect.js";
import generateToken from "../utils/generate_token.js";
import bcrypt from 'bcrypt';
import { config } from "dotenv";
import { isPasswordValid } from "../utils/verify_password.js";
config();

export const userRegisterController = async (request,response) => {
    const image = request.file;
    
    const { username , email , password , balance } = request.body;

    //encrypt -> 1. random salt,2.password
    const randomSalt = await bcrypt.genSalt(Number.parseInt(process.env.round_number));

    const hashedPassword = await bcrypt.hash(password , randomSalt);


    if(username && email && hashedPassword && balance && image){

        const sql = `INSERT INTO user (username,email,password,balance,profile_image) VALUES (?,?,?,?,?)`;

        const insertValue = [username,email,hashedPassword,balance,image.filename];

        pool.query(sql,insertValue,(error,result) => {
            if(error) return response.status(500).json({message : "Something Went Wrong"});
            response.status(200).json({
                message : "Register Success",
                token : generateToken({ username })
            })
        })
    }else{
        response.status(403).json({
            message : "All Field Must Not Be Empty"
        });
    }
}

export const userLoginController = async (request,response) => {
    const { email , password } = request.body;

    if(email && password) {
        const sql = `SELECT * FROM user WHERE email = ?`
        pool.query(sql,email,(error,row) => {
            if(error) return response.status(500).json({ message : "Something went wrong" })
            if(row){
                const isPasswordValidate = isPasswordValid(password , row[0].password);
                if(isPasswordValidate){
                    const username = row[0].username;
                    const token = generateToken({ username });
                    response.status(200).json({
                        message : "Login Success",
                        token : token
                    })
                }
            }
        })
    }
    else{
        return response.status(401).json({message : "All Field Must not be empty"})
    }
} 