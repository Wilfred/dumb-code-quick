# Dumb Code Quick 🤔⌨️💨

Dumb Code Quick (DCQ) is a project exploring code completion inside
implementation code, when you already have a unit test.

## Approach

(1) Take a bunch of programming exercises with tests available. Write
incomplete solutions.

(2) Train a machine learning model to optimise for the following (best
outcome first):

A: It makes all the tests pass
B: It makes some of the tests pass
B: It executes the tests without error (other than failing the assertion)
