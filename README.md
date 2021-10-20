# Handshake

An interactive authentication method using secret handshakes as passphrases, built with [Matter.js](https://brm.io/matter-js/).

I can't remember where this idea came from, but I thought it might be a fun way of restricting certain parts of a site to only those who know the secret handshake. I've really tried to think of ways that this could be a legitimate, innovative method of authentication so I can take security Twitter by storm, but I've got nothing so far.

Here's a sneak peek.

![Handshake demo](https://raw.githubusercontent.com/egargan/handshake/main/readme-demo.gif)

This project's still very much work in progress. Some features that are still to add are:

* Some sort of feedback for which 'bump' you've just performed, i.e. top, bottom, or front. The bump detection logic's in place, but I just need e.g. 'top!' text to appear.

* A 'sparkle' state for the hands that triggers on-click. This will add a fourth contact type, increasing passphrase entropy and making this authentication method _even more_ secure.

* An accept and deny response from the right hang (I'm thinking a thumbs up or a 'stop' hand), after a handshake has been entered.
