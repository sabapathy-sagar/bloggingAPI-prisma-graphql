import jwt from 'jsonwebtoken';

const getUserId = (request) => {
    //grab the authorization token from the request header
    const header = request.request.headers.authorization;

    if (!header) {
        throw new Error('Authentication required!');
    }

    const token = header.replace('Bearer ', '')

    //verify if it is the valid token of the logged in user
    const decoded = jwt.verify(token, 'thisisasecret');

    return decoded.userId;
}

export {getUserId as default}