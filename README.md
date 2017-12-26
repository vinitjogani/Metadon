# Metadon


Metadon is a simple card game but the rules can be a bit challenging to understand for newcomers. It is a multiplayer game (usually fun with 2-5 people) that refreshes in real-time (using Meteor API) as you play cards. The basic user-flow goes as follows:

1. User clicks on the sign-in button, and then on "Create account" to quickly create an account. Then, the user signs in.
2. When everyone you want to play with has signed in, any one person can click on "New game". This updates the Game ID textbox.
3. Click on the airplane button to send this Game ID, and then enter the username of a fellow player to send the Game ID as a notification which he/she can copy and paste in the Game ID textbox.
4. Once everybody gets the code, click on Start Game and wait for everyone to appear on the top panel.


That's it, you're ready to play! The instructions of the game are as follows:

1. Basically, whoever gets the Ace of Spades starts. Whoever finishes all their cards first, wins!
2. On the bottom panel, you can see all the cards you have, and on the top panel you can see whose turn it is by checking for a line under the player's name.
3. When it is your turn, you can see all the cards you have. If you are the first player in the round, you can play any card you like.
4. If you are not the first player in your turn, you can only play a card of the suite that is being played already.
5. However, if you do not have a card of that suite, you can "hand over" the card. This means that the card you selected, and all the cards played before you in the turn, go to the player who played the highest-order card (which isn't good for them).
6. The "highest"-order card is an Ace, followed by King, Queen, Jack, and so on.
7. After a round is over,  you can see the "Last turn" above, to see what each of the other players played.


That's about it for rules - you'll learn more as you play. Here are some tips and notes:

1. Try to play higher-order cards first to avoid being handed-over cards.
2. Play smartly when you start the round to "finish-off" a suite from your hand so that you can hand-over cards to other people.
3. Note that if the only 4 cards left in the game are of different colors, the system randomly shuffles some extra cards to every remaining player's hand to prevent the game from running indefinitely.


Happy playing!
