import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import getUserId from '../utils/getUserId';

const Mutation = {
    async createUser (parent, args, {prisma}, info) {

        //Take in password -> validate password -> Hash password -> Generate auth token
        if (args.data.password.length < 8) {
            throw new Error("Password should be at least 8 characters long.");
        }

        const password = await bcrypt.hash(args.data.password, 10);

        const emailTaken = await prisma.exists.User({email: args.data.email});

        if (emailTaken) {
            throw new Error('Email taken');
        }

        const user = await prisma.mutation.createUser({
            data: {
                ...args.data,
                password
            }
        });

        return {
            user,
            token: jwt.sign({ userId: user.id}, 'thisisasecret')
        };

    },
    async login (parent, args, {prisma}, info) {
        //check if the entered email exists
        const emailExists = await prisma.exists.User({email: args.data.email});

        if (!emailExists) {
            throw new Error('The given email does not exist!');
        }

        //check if the entered password is right
        const user = await prisma.query.user({
            where: {
                email: args.data.email
            }
        });

        const isMatch = await bcrypt.compare(args.data.password, user.password);
        
        if (!isMatch) {
            throw new Error('Enter the right password!');
        }

        //send back the user data with the new token
        return {
            user,
            token: jwt.sign({ userId: user.id}, 'thisisasecret')
        }

    },
    async deleteUser (parent, args, {prisma, request}, info) {
        const userId = getUserId(request);

        const userExists = await prisma.exists.User({id: args.id})

        if(!userExists){
            throw new Error('User does not exist!');
        }

        const user = await prisma.mutation.deleteUser(
            {
                where: {
                    id: userId
                }
            }, info
        );

        return user;

    },
    async updateUser (parent, args, {prisma, request}, info) {
        const userId = getUserId(request);

        return prisma.mutation.updateUser({
            where: {
                id: userId
            },
            data: args.data
        }, info)

    },
    createPost (parent, args, {prisma, request}, info) {
        //get the user id of the logged in user based on the auth token
        const userId = getUserId(request);

        return prisma.mutation.createPost({
            data: {
                title: args.data.title,
                body: args.data.body,
                published: args.data.published,
                author: {
                    connect: {
                        id: userId
                    }
                }
            }
        }, info)
    },
    async deletePost (parent, args, {prisma, request}, info) {
        const userId = getUserId(request);

        //check if post exists for a user based on his auth token
        const postExists = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId
            }
        })

        if (!postExists) {
            throw new Error('Unable to delete post');
        }

        return prisma.mutation.deletePost({
            where: {
                id: args.id
            }
        }, info)

    },
    async updatePost (parent, args, {prisma, request}, info) {
        const userId = getUserId(request);

        //check if post exists for a user based on his auth token
        const postExists = await prisma.exists.Post({
            id: args.id,
            author: {
                id: userId
            }
        })

        if (!postExists) {
            throw new Error('Unable to delete post');
        }

        return prisma.mutation.updatePost({
            data: args.data,
            where: {
                id: args.id
            }
        }, info)
    },
    async createComment (parent, args, {prisma, request}, info) {
        const userId = getUserId(request);

        return prisma.mutation.createComment({
            data: {
                text: args.data.text,
                author: {
                    connect: {
                        id: userId
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
    async deleteComment (parent, args, {prisma, request}, info) {
        const userId = getUserId(request);

        //check if comment exists for the given user
        const commentExists = await prisma.exists.Comment({
            id: args.id,
            author: {
                id: userId
            }
        });

        if (!commentExists) {
            throw new Error('Unable to delete!');
        }

        return prisma.mutation.deleteComment({
            where: {
                id: args.id
            }
        }, info)

    },
    async updateComment (parent, args, {prisma, request}, info) {
        const userId = getUserId(request);

        //check if comment exists for the given user
        const commentExists = await prisma.exists.Comment({
            id: args.id,
            author: {
                id: userId
            }
        });

        if (!commentExists) {
            throw new Error('Unable to update comment!');
        }

        return prisma.mutation.updateComment({
            where: {
                id: args.id
            },
            data: args.data
        },info)
    }
};

export {Mutation as default}