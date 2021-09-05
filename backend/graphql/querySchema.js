const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} = require('graphql');

const UserType = require('./graphqlObject/User');
const User = require("../model/User");

const querySchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "query",
        fields: () => ({
            // message: {
            //     type: GraphQLString,
            //     resolve: (parent, args, context) => {
            //         console.log(context());
            //         return "Hello :)";
            //     }
            // }

            currentUser: {
                type: UserType,
                description: "Get the logged in user via accessToken verification",
                resolve: async (parent, args, context) => {
                    if(!context().user) return { error: null }
                    return await User.findOne({ username: context().user });
                }
            }
        })
    })
});

module.exports = querySchema;