
import "../imports/api/Messages.js";
import "../imports/api/Games.js";
import "../imports/api/Cards.js";

if (Meteor.isServer) {
    Meteor.publish("userData", function () {
        return Meteor.users.find({}, { fields: { 'username': 1 } });
    })
}