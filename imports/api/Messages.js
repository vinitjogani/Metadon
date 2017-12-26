import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const Messages = new Mongo.Collection("Messages");

if (Meteor.isServer) {
    Meteor.publish("Messages", function () {
        return Messages.find({ user: Meteor.user().username });
    })
}

Meteor.methods({
    "message.send"(user, gameId) {
        Messages.insert({
            from: Meteor.user().username,
            game: gameId,
            user: user,
            createdAt: new Date()
        });
    }
});