const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
    me: async (parent, args, context) => {
        if (context.user) {
            const userData = await User.findOne({})
                .select('__v-password')
                .populate('books')

            return userData;
        }
        throw new AuthenticationError('You need to be logged in!');
    },
},

    Mutation: {

      login: async (parent, { email, password }) => {
          const user = await User.findOne({ email });
      
          if (!user) {
              throw new AuthenticationError('No user found with this email address');
          }
      
          const correctPw = await user.isCorrectPassword(password);
      
          if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
          }
      
          const token = signToken(user);
      
          return { token, user };
      },

      addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
      },
          
      saveBook: async (parent, args, context) => {
              if (context.user) {
                  const userUpdate = await User.fingbyIdAndUpdate(
                { _id: context.user._id },
                      { $addToSet: { savedBooks: args.input } },
                { new: true }
                  );
      
                  return userUpdate;
              }
              throw new AuthenticationError('You need to be logged in!');
          },
        
              removeBook: async (parent, args, context) => {
                  if (context.user) {
                      const userUpdate = await User.findOneAndUpdate(
                { _id: context.user._id },
                          { $pull: { savedBooks: { bookId: args.bookId } } },
                { new: true }
                      );
      
                      return userUpdate;
                  }
                  throw new AuthenticationError('You need to be logged in!');
              },

    },
}

module.exports = resolvers;
