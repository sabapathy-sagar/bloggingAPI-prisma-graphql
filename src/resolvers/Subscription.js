const Subscription = {
    comment: {
        subscribe (parent, args, ctx, info) {
            const {postId} = args;
            const {prisma} = ctx;
            
            //subscribe to commnets of a particular post
            return prisma.subscription.comment({
                where: {
                    node: {
                        post: {
                            id: postId
                        }
                    }
                }
            }, info);

        }
    },
    post: {
        subscribe (parent, args, ctx, info) {
            const { prisma } = ctx;

            //subscribe to posts that are published
            return prisma.subscription.post({
                where: {
                    node: {
                        published: true 
                    }
                }
            }, info)

        }
    },
    myPost: {
        subscribe (parent, args, ctx, info) {
            const {prisma, request} = ctx;

            //get the user id of the authorized user
            const userId = getUserId(request);

            //subscribe to individual user's posts
            return prisma.subscription.post({
                where: {
                    node: {
                        author: {
                            id: userId
                        }
                    }
                }
            }, info)
        }
    }

};

export {Subscription as default}