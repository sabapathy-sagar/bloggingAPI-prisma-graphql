import jwt from 'jsonwebtoken';

const getUserId = (request, requireAuth = true) => {
    //grab the authorization token from the http request header (request.request.headers.authorization) 
    //or from websocket context (request.connection.context.Authorization)
    const header = request.request ? request.request.headers.authorization : request.connection.context.Authorization;
    
    if (header) {
        const token = header.replace('Bearer ', '')

        //verify if it is the valid token of the logged in user
        const decoded = jwt.verify(token, 'thisisasecret');
    
        return decoded.userId;
    }

    //if authentication required, i.e requireAuth = true, throw error 
    if (requireAuth) {
        throw new Error('Authentication required!');
    }

    //f authentication not required, i.e requireAuth = false, return null as the userId
    return null;

}

export {getUserId as default}