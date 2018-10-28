const Mutation = {
    async createUser (parent, args, {prisma}, info) {

        const emailTaken = await prisma.exists.User({email: args.data.email});

        if (emailTaken) {
            throw new Error('Email taken');
        }

        const user = await prisma.mutation.createUser({data: args.data}, info);

        return user;

    },
    async deleteUser (parent, args, {prisma}, info) {

        const userExists = await prisma.exists.User({id: args.id})

        if(!userExists){
            throw new Error('User does not exist!');
        }

        const user = await prisma.mutation.deleteUser(
            {
                where: {
                    id: args.id
                }
            }, info
        );

        return user;

    },
    async updateUser (parent, args, {prisma}, info) {

        return prisma.mutation.updateUser({
            where: {
                id: args.id
            },
            data: args.data
        }, info)

    },
    createPost (parent, args, {prisma}, info) {

        return prisma.mutation.createPost({
            data: {
                title: args.data.title,
                body: args.data.body,
                published: args.data.published,
                author: {
                    connect: {
                        id: args.data.author
                    }
                }
            }
        }, info)
    },
    async deletePost (parent, args, {prisma}, info) {

        return prisma.mutation.deletePost({
            where: {
                id: args.id
            }
        }, info)

    },
    async updatePost (parent, args, {prisma}, info) {

        return prisma.mutation.updatePost({
            data: args.data,
            where: {
                id: args.id
            }
        }, info)
    },
    async createComment (parent, args, {prisma}, info) {

        return prisma.mutation.createComment({
            data: {
                text: args.data.text,
                author: {
                    connect: {
                        id: args.data.author
                    }
                },
                post: {
                    connect: {
                        id: args.data.post
                    }
                }
            }
        }, info)

    },
    deleteComment (parent, args, {db, pubsub}, info) {
        const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);

        if(commentIndex === -1){
            throw new Error('comment not found!');
        }

        const deletedComments = db.comments.splice(commentIndex, 1);

        pubsub.publish(`comment ${deletedComments[0].post}`, {
            comment: {
                mutation: 'DELETED',
                data: deletedComments[0]
            }
        })


        return deletedComments[0];
    },
    async updateComment (parent, args, {prisma}, info) {
        
        return prisma.mutation.updateComment({
            where: {
                id: args.id
            },
            data: args.data
        },info)
    }
};

export {Mutation as default}