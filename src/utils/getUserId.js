import jwt from 'jsonwebtoken';

const getUserId = (request, requireAuth = true) => {
    //grab the authorization token from the request header
    const header = request.request.headers.authorization;

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