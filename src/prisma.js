import {Prisma} from 'prisma-binding';

const prisma = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: 'http://localhost:4466'
})

//query users
prisma.query.users(null, '{id, name, email}').then((data) => {
    console.log(data);
});

//query comments
prisma.query.comments(null, '{id text author {id name}}').then((data) => {
    console.log(JSON.stringify(data, undefined, 2));
})

//createPost mutation
prisma.mutation.createPost({
    data: {
        title: 'prisma is awesome',
        body: 'bla bla',
        published: true,
        author: {
            connect: {
                id: 'cjnm4a9c2000u0a31sam2uxoo'
            }
        }
    }
}, '{ id title body published}').then((data) => {
    console.log(data);

    //query all users
    return prisma.query.users(null, '{id, name, posts {id title}}');
}).then((data) => {
    console.log(JSON.stringify(data, undefined, 2));
})

//updatePost mutation
prisma.mutation.updatePost({
    data: {
        published: false
    },
    where: {
       id: 'cjnmsyhbt000i0a31zv974goy' 
    }
}, '{id title published}').then((data) => {
    console.log(data);
    //query to get all posts
    return prisma.query.posts(null, '{id title published}');
}).then((data) => {
    console.log(JSON.stringify(data, undefined, 2));
})

const createPostForUser = async (authorId, postData) => {

    const post = await prisma.mutation.createPost({
        data: {
            ...postData,
            author: {
                connect: {
                    id: authorId
                }
            }
        }
    }, '{id}')

    const user = await prisma.query.user({
        where: {
            id: authorId
        }
    }, '{id name posts {id title}}')

    return user;
};

createPostForUser('cjnmt944f00100a315wxas0kd', {
    title: 'async is great',
    body: 'yes it is',
    published: true
}).then((data) => {
    console.log(JSON.stringify(data, undefined, 2));
})