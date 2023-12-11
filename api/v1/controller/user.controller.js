const DB = require('../../../config/database/config');


const user = { 
    insertUser: async (req, res) => { 
        const {username, displayName, id} = req.body;
        let connection = await DB.getConnection();
        try {
            await connection.beginTransaction();
            
            await connection.query(
            "INSERT INTO USERS (ID, USERNAME, DISPLAY_NAME) VALUES (?, ?, ?)",
            [id, username, displayName]);

            await connection.commit();

            return res.status(200).json({ msg: 'user data sync successfully' });

        } catch (err) {
            console.error(err);
            if (connection) {
                await connection.rollback();
            }
            return res.status(500).json({ msg: 'Server Error' });
        }finally {
            if (connection) {
                connection.release();
            }
        }

    },
}

module.exports = user 