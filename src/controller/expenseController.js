import pool from "../db/dbConnect.js";

export const addNewExpenseController = (request,response) => {
    const authenticatedUsername = request.user.username;
    const { title,type,category,description,expense_amount } = request.body;
    pool.query(`SELECT id FROM user WHERE username = ?`,authenticatedUsername , (error,row) => {
        if(error) return response.status(500).json({
            message : "Something Went Wrong"
        })

        if(!title && !type && !category && !description && !expense_amount){
            return response.status(400).json({
                message : "Bad Request"
            })
        }
        const sql_insert = `INSERT INTO expense (title,type,category,description,expense_amount,user_id)
                                        VALUES (?,?,?,?,?,?)`;
        const insertValue = [title , type , category , description , expense_amount , row[0].id]
        pool.query(sql_insert , insertValue , (error,result) => {
            if(error) return response.status(500).json({
                message : "Add Failed",
            })
            if(type.toLowerCase() === "income"){
                const editBalanceSQL = `UPDATE user SET balance = balance + ? WHERE id = (SELECT user_id FROM expense WHERE user_id = ? ORDER BY user_id LIMIT 1)`
                pool.query(editBalanceSQL,[expense_amount,row[0].id],(error,result) => {
                    if(error) return response.status(500).json({
                        message : "Something went wrong"
                    })
                    response.status(200).json({
                        message : "Processing Transaction success",
                        result
                    })
                })
            }
            else{
                const editBalanceSQL = `UPDATE user SET balance = balance - ? WHERE id = (SELECT user_id FROM expense WHERE user_id = ? ORDER BY user_id LIMIT 1)`
                pool.query(editBalanceSQL,[expense_amount,row[0].id],(error,result) => {
                    if(error) return response.status(500).json({
                        message : "Something went wrong"
                    })
                    response.status(200).json({
                        message : "Processing Transaction success",
                        result
                    })
                })
            }
            
        })
    })
}
export const getAllAuthenticatedUserExpense = ( request , response) => {
    const authenticatedUsername = request.user.username;
    const sql = `SELECT e.* FROM user u INNER JOIN expense e ON u.id = e.user_id WHERE u.username = ?`;
    pool.query(sql , authenticatedUsername , (error,rows) => {
        if(error) return response.status(500).json({
            message : "Something went wrong"
        })
        response.status(200).json({
            user : authenticatedUsername,
            data : rows
        })
    })
}
export const editAuthenticatedUserExpense = (request,response) => {
    const authenticatedUsername = request.user.username;
    const { id } = request.params;
    const { title,category,description } = request.body;

    if(!title && !category && !description){
        return response.status(400).json({
            message : "Bad Request"
        })
    }
    const insertValue = [title,category,description,id,authenticatedUsername];
    const sql = `UPDATE expense SET title = ?,category = ?,description = ? WHERE id = ? AND user_id = (SELECT id FROM user WHERE username = ?)`;
    pool.query(sql,insertValue,(error , result) => {
        if(error)return response.status(500).json({
            message : "Something went wrong"
        })
        response.status(200).json({
            result
        })
    })
}
export const expensePagination = (request,response) => {
    const authenticatedUsername = request.user.username;
    const limit = 2;
    const page  = Number.parseInt(request.query.page) | 1;
    const offset = (page - 1) * limit; // = 10

    const sql = `SELECT * FROM expense WHERE user_id = (SELECT id FROM user WHERE username = ?) LIMIT ? OFFSET ?`;
    const insertValue = [authenticatedUsername,limit,offset];

    pool.query(sql,insertValue,(error,rows) => {
        if(error) return response.status(500).json({
            message : error.message
        });
        response.status(200).json({
            data : rows
        })
    })
}
