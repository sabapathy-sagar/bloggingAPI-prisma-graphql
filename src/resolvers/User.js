import getUserId from '../utils/getUserId'

const User = {
    email: {
         //name of the fragment - userId
        //from User
        //the fields that we want - id
        fragment: 'fragment userId on User { id }',
        resolve(parent, args, { request }, info) {
            const userId = getUserId(request, false)

            if (userId && userId === parent.id) {
                return parent.email
            } else {
                return null
            }
        }
    },
    posts: {
        fragment: 'fragment userId on User { id }',
        resolve (parent, args, ctx, info) {
            const { prisma } = ctx;

            return prisma.query.posts({
                where: {
                    published: true,
                    author: {
                        id: parent.id
                    }
                }
            }, info)

        }
    }
}

export { User as default }