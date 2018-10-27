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