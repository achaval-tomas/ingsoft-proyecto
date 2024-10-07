from random import shuffle

from src.database.cards.movement_card import movement_data
from src.database.cards.shape_card import ShapeType
from src.schemas.card_schemas import ShapeCardSchema


class ShapeCardDealer:
    def __init__(self, nplayers: int):
        shape_cards = [
            ShapeCardSchema(
                shape=c.value,
                isBlocked=False,
            )
            for c in ShapeType
        ] * 2
        shuffle(shape_cards)
        self.deck = shape_cards
        self.cards_per_player = len(shape_cards) // nplayers

    def deal_shape_cards(self):
        player_cards = self.deck[0 : self.cards_per_player]
        self.deck = self.deck[self.cards_per_player :]
        return player_cards


class MovCardDealer:
    def deal_movement_cards(ncards: int = 3):
        cards = list(movement_data.keys()) * 7
        shuffle(cards)
        return cards[0:ncards]
