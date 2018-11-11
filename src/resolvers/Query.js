import getUserId from '../utils/getUserId';

const Query = {
    users (parent, args, {prisma}, info) {
        //operation arguments object
        const opArgs = {};

        if(args.query){
            opArgs.where = {
                OR: [{
                    name_contains: args.query
                }, {
                    email_contains: args.query
                }]
            }
        }
        return prisma.query.users(opArgs, info);
    },
    posts (parent, args, {prisma}, info) {

        const opArgs = {};

        if(args.query){
            opArgs.where = {
                OR: [{
                    title_contains: args.query
                }, {
                    body_contains: args.query
                }]
            }

        }

        return prisma.query.posts(opArgs, info);

    },
    comments (parent, args, { prisma }, info) {
        //return db.comments;

        return prisma.query.comments(null, info)
    },
    async me (parent, args, {prisma, request}, info) {
        const userId = getUserId(request);

        const user = await prisma.query.user({
            where: {
                id: userId
            }
        }, info)

        return user;
    },
    async post (parent, args, {prisma, request}, info) {
        //set the second argument (requireAuth) of getUserId method to false, 
        //so that the post query can be made even by anonymous users
        const userId = getUserId(request, false);

        //if user anonymous, return only published post
        //if user is logged in, return both published and unpublished post
        const posts = await prisma.query.posts({
            where: {
                id: args.id,
                OR: [{
                    published: true
                }, {
                    author: {
                        id: userId
                    }
                }
                ]
            }
        }, info) 

        if (posts.length === 0) {
            throw new Error('Post not found!');
        }

        return posts[0];

    }
};

export {Query as default}