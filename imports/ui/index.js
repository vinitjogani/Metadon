import { Meteor } from "meteor/meteor";
import { Template as $ } from "meteor/templating";

import { Messages } from "../api/Messages.js";
import { Games } from "../api/Games.js";
import { Cards } from "../api/Cards.js";
import "./index.html";

$.game.onCreated(() => {
    Meteor.subscribe("Games");
    Meteor.subscribe("Cards");
    id = Router.current().params._id;
    Session.set("game", id);
    Meteor.call("game.join", id, (err, res) => {
        Session.set("player", res);
    });
});

$.game.helpers({
    deck() {
        if (Session.get("game")) {
            d = Games.findOne(Session.get("game")).deck;
            if (d.length == 0) {
                p = Games.findOne(Session.get("game")).prev;
                if (p.length != 0) {
                    return p;
                }
            }
            return d;
        }
    }, 
    players() {
        if (Session.get("game")) {
            p = Games.findOne(Session.get("game")).players;
            Session.set("player", p.indexOf(Meteor.userId()));
            return p;
        }
    },
    winners() {
        if (Session.get("game")) {
            return Games.findOne(Session.get("game")).winners;
        }
    }, 
    turn(x) {
        if (Session.get("game")) {
            g = Games.findOne(Session.get("game"));
            return g? x == g.players[g.turn] : null;
        }
    },
    ndeck() {
        if (Session.get("game")) {
            var g = Games.findOne(Session.get("game"));
            d = g.deck;
            p = g.prev;
            if (d.length == 0 && p.length == g.players.length) {
                return [];
            }
            else if (d.length == 0 && p.length != 0) {
                return Array.from(Array(g.players.length - g.prev.length).keys());
            }
            return Array.from(Array(g.players.length - g.deck.length).keys());
        }
    },
    cardImage() {
        return this[0] + this[1] + ".png";
    },
    cards() {
        return Cards.findOne({ user: Meteor.userId() }).cards.sort();
    },
    over() {
        if (Session.get("game")) {
            var g = Games.findOne(Session.get("game"));
            return g ? g.winners.length >= 2: false;
        }
        return false;
    }, 
    cardCode(card) {
        conversionChart = { '11': 'J', '12': 'Q', '13': 'K', '14': 'A' };
        suits = { 'S': '♠', 'C': '♣', 'D': '♦', 'H': '♥'}
        if (conversionChart[card[1]]) {
            card[1] = conversionChart[card[1].toString()];
        }
        return suits[card[0]] + card[1];
    },
    prev() {
        if (Session.get("game")) {
            var g = Games.findOne(Session.get("game"));
            return g?g.prev:null;
        }
    },
    suit(x) {
        return x[0];
    }
});

$.card.helpers({
    cardImage() {
        return this[0] + this[1] + ".png";
    },
    opacity() {
        g = Games.findOne(Session.get("game"));
        d = g.deck;
        t = g.turn;
        c = Cards.findOne({ user: Meteor.userId() }).cards;
        if (t == parseInt(Session.get("player"))) {
            if (d.length == 0 || d[d.length - 1][0] == this[0]) {
                return 1;
            }
            else if (containsSuit(c, d[d.length - 1][0]) == false) {
                return 1;
            }
        }
        return 0.5;
    }
});

$.card.events({
    "click .playCard"() {
        Meteor.call("game.turn", this, Session.get("player"), Session.get("game"));
    }
})

$.games.onCreated(() => {
    Meteor.subscribe("Messages");
});

$.games.helpers({
    messages() {
        return Messages.find({ createdAt: { $gte: new Date((new Date()) - 180000) } });
    }
})

$.games.events({
    "click #newGame"() {
        Meteor.call("game.new", (err, id) => {
            var roomId = document.getElementById("roomId");
            roomId.value = id;
            roomId.select();
            document.execCommand('copy');
        });        
    }, 
    "click #joinGame"() {
        Router.go("/game/" + document.getElementById("roomId").value)
    },
    "click #share"() {
        username = prompt("Enter username: ");
        Meteor.call("message.send", username, document.getElementById("roomId").value);
    }
})

$.player.onCreated(() => {
    Meteor.subscribe("userData");
});

$.player.helpers({
    myName() {
        user = Meteor.users.findOne(this.toString());
        if (user) {
            return user.username;
        }
    }
})



function containsSuit(cards, suit) {
    for (card of cards) {
        if (card[0] == suit) {
            return true;
        }
    }
    return false;
}
