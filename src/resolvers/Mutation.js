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
    updatePost (parent, args, {db, pubsub}, info) {
        const {id, data} = args;

        const post = db.posts.find((post) => post.id === id);
        const originalPost = {...post};

        if(!post) {
            throw new Error('Post does not exist!');
        }

        if(typeof data.title === 'string') {
            post.title = data.title;
        };

        if(typeof data.body === 'string'){
            post.body = data.body;
        }

        if(typeof data.published === 'boolean') {
            post.published = data.published;

            //original post was published and the updated post is unpublished, then delete the post
            if (originalPost.published && !post.published){
                //delete
                pubsub.publish('post', {
                   post: {
                        mutation: 'DELETED',
                        data: originalPost
                   } 
                })
            } else if (!originalPost.published && post.published){
                //original post was unpublished and the updated post is published, then create the post
                //create
                pubsub.publish('post', {
                    post: {
                         mutation: 'CREATED',
                         data: post
                    } 
                 })

            }
            //if the post was alredady published and only the other fields were updated
            if (originalPost.published === post.published) {
                //update
                pubsub.publish('post', {
                    post: {
                         mutation: 'UPDATED',
                         data: post
                    } 
                 })
            }
        } 

        return post;

    },
    createComment (parent, args, {db, pubsub}, info) {
        const userExists = db.users.some((user) => user.id === args.data.author);
        const postExists = db.posts.some((post) => post.id === args.data.post);
        const currentPost = db.posts.find((post) => post.id === args.data.post);
        
        if (!userExists) {
            throw new Error('User does not exist');
        }

        if (!postExists || !currentPost.published) {
            throw new Error('Post does not exist or is not puslished');
        }

        const comment = {
            id: new Date().valueOf() + 123,
            ...args.data
        };

        db.comments.push(comment);

        //publish the comment as soon as it is created, so that the listeners subscribed 
        //to 'comment postId' subscription are notified
        pubsub.publish(`comment ${args.data.post}`, {
            comment: {
                mutation: 'CREATED',
                data: comment
            }
        })

        return comment;
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
    updateComment (parent, args, {db, pubsub}, info) {
        const {id, data} = args;

        const comment = db.comments.find((comment) => comment.id === id);

        if (!comment) {
            throw new Error('comment not found!');
        }

        if(typeof data.text === 'string'){
            comment.text = data.text;
        }

        pubsub.publish(`comment ${comment.post}`, {
            comment: {
                mutation: 'UPDATED',
                data: comment
            }
        })

        return comment;
    }
};

export {Mutation as default}