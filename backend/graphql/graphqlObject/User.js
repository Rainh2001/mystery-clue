const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLEnumType
} = require('graphql');

const User = new GraphQLObjectType({
    name: "User",
    description: "User associated information",
    fields: () => ({
        username: { type: GraphQLString },
        password: { type: GraphQLString },
        accountType: { type: accountTypeEnum }
    })
});

const accountTypeEnum = new GraphQLEnumType({
    name: "accountType",
    values: {
        default: { value: "player" },
        admin: { value: "admin" }
    }
})

module.exports = User;