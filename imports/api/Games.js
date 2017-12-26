import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { Cards } from './Cards.js';

export const Games = new Mongo.Collection("Games");

if (Meteor.isServer) {
    Meteor.publish("Games", function () {
        return Games.find({}, { fields: { 'deck': 1, '_id': 1, 'players':1, 'turn':1, 'winners':1, 'prev':1 } });
    })
}

function deck() {
    d = [];
    for (i of ["D", "H", "C", "S"]) {
        for (j of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]) {
            d.push([i, j]);
        }
    }
    return d;
}

function shuffle() {
    var d = deck();
    p = [[], [], []];

    c = 0;
    while (d.length != 0) {
        r = Math.ceil(Math.random() * (d.length - 1));
        p[c].push(d[r]);
        d.splice(r, 1);
        c++;
        c %= 3;
    }

    return p;
}

function starter(x) {
    for (i in x) {
        if (x[i].join(';').split(';').indexOf("S,14") > -1) {
            return i;
        }
    }
    return 0;
}

function getTwo(current) {
    temp = shuffle()[0];
    for (c of current) {
        temp = removeCard(temp, c);
    }
    return [temp[0], temp[1]];
}

function containsSuit(cards, suit) {
    for (card of cards) {
        if (card[0] == suit) {
            return true;
        }
    }
    return false;
}

function removeCard(cards, card) {
    out = [];
    for (c in cards) {
        if (cards[c].join(',') != card.join(',')) {
            out.push(cards[c]);
        }
    }
    return out;
} 

Meteor.methods({
    "game.new"() {
        c = shuffle();
        s = starter(c);

        Games.remove({ owner: Meteor.userId() });

        var id = Games.insert({
            cards: c,
            turn: parseInt(s),
            owner: Meteor.userId(),
            players: [],
            deck: [], 
            winners: [],
            prev:[]
        });

        return id.toString();
    },
    "game.join"(id) {
        var game = Games.findOne(id);
        var cuser = Meteor.userId();

        if (Cards.find({ user: cuser }).count() == 0) {
            Cards.insert({ user: cuser, cards: [] });
        }

        if (game != null && game.players.length < 3 && game.players.indexOf(cuser) < 0 && game.winners.indexOf(cuser)<0) {
            Games.update(id, { $set: { players: game.players.concat(cuser) } });
            Cards.update({ user: cuser}, { $set: { cards: game.cards[game.players.length] } });
            return game.players.length;
        }        
        else {
            return 0;
        }
    }, 
    "game.turn"(card, player, id) {
        game = Games.findOne(id);
        cards = Cards.findOne({ user: Meteor.userId() }).cards;
        
        cuser = Meteor.userId();
        ps = game.players.length;

        if (game.turn == player) {
            d = Array.from(game.deck);
            if (d.length == 0 || d[d.length - 1][0] == card[0]) {
                d.push(card);
                prev = (game.turn + (ps-1)) % ps;
                i = 0;

                if (d.length == ps) {
                    n = d.map((x) => x[1]);
                    max = n.indexOf(Math.max(...n));
                    i = max == (ps - 1) ? player : (max == (ps - 2) ? prev : (prev + 2) % ps);
                }

                Games.update(id, {
                    $set: {
                        deck: d.length == ps? [] : d,
                        turn: d.length == ps ? i : (game.turn + 1) % ps,
                        prev: d.length == ps ? d : game.prev
                    }
                });
                Cards.update({ user: cuser }, { $set: { cards: removeCard(cards, card) } });

                if (d.length >= ps) {
                    for (u of game.players) {
                        if (Cards.findOne({ user: u }).cards.length == 0) {

                            removed = Array.from(game.players);
                            removed.splice(removed.indexOf(u), 1);

                            Games.update(id, {
                                $set: {
                                    players: removed,
                                    winners: game.winners.concat(u),
                                    turn: game.turn % (ps - 1)
                                }
                            });

                            ps -= 1;
                        }
                    }

                    game = Games.findOne(id);

                    current = [];
                    for (u of game.players) {
                        current = current.concat(Cards.findOne({ user: u }).cards);
                    }
                    var suits = current.map((x) => x[0]).sort();
                    if (current.length <= 4 && suits.join(',') == unique(suits).join(',')) {
                        for (u of game.players) {
                            newTwo = getTwo(current);
                            current = current.concat(newTwo);
                            Cards.update({ user: u }, {
                                $set: {
                                    cards: Cards.findOne({ user: u }).cards.concat(newTwo)
                                }
                            })
                        }
                    }
                }
                
            }
            else if (containsSuit(cards, d[d.length - 1][0]) == false) {
                prev = (game.turn + (ps-1)) % ps;
                i = (d.length == 1 || d[1][1] > d[0][1]) ? prev : (prev + (ps-1)) % ps;
                target = game.players[i];
                d.push(card);
                c = Array.from(Cards.findOne({ user: target }).cards).concat(d);
                Games.update(id, { $set: { deck: [], prev: d } });
                Cards.update({ user: target }, { $set: { cards: c } });
                Cards.update({ user: cuser }, { $set: { cards: removeCard(cards, card) } });

                if (Cards.findOne({ user: cuser }).cards.length == 0) {
                    removed = Array.from(game.players);
                    removed.splice(game.players.indexOf(cuser), 1);

                    Games.update(id, {
                        $set: {
                            players: removed,
                            winners: game.winners.concat(cuser),
                            turn: game.turn % (ps - 1)
                        }
                    });
                }
            }
        }
    }

})

contains = function (x, v) {
    for (var i = 0; i < x.length; i++) {
        if (x[i] === v) return true;
    }
    return false;
};

unique = function (x) {
    var arr = [];
    for (var i = 0; i < x.length; i++) {
        if (!contains(arr, x[i])) {
            arr.push(x[i]);
        }
    }
    return arr;
}