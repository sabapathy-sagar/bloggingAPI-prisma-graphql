import getUserId from '../utils/getUserId';

const User = {
    email (parent, args, ctx, info) {
        const {request} = ctx;

        const userId = getUserId(request, false);

        //check if userId exists and the userId is equal to the parent.id
        if (userId && userId === parent.id) {
            return parent.email;
        } else {
            return null;
        }

    }

};

export {User as default}