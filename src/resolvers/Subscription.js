const Subscription = {
    comment: {
        subscribe (parent, args, ctx, info) {
            const {postId} = args;
            const {prisma} = ctx;

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
            const {db, pubsub} = ctx;

            //set up channel, with channel name 'post'
            return pubsub.asyncIterator('post');

        }
    }

};

export {Subscription as default}