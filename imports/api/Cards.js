import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const Cards = new Mongo.Collection("Cards");

if (Meteor.isServer) {
    Meteor.publish("Cards", function () {
        return Cards.find({user: Meteor.userId()});
    })
}
