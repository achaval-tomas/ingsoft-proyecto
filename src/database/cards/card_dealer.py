from random import shuffle

import src.database.crud.crud_cards as cc
from src.database.cards.movement_card import movement_data
from src.database.cards.shape_card import shape_data
from src.database.session import get_db
from src.schemas.card_schemas import ShapeCardSchema


class ShapeCardDealer:
    def __init__(self, nplayers: int):
        shape_cards_b = [
            ShapeCardSchema(
                shape=c,
                isBlocked=False,
            )
            for c in shape_data
            if c[0] == 'b'
        ] * 2
        shape_cards_c = [
            ShapeCardSchema(
                shape=c,
                isBlocked=False,
            )
            for c in shape_data
            if c[0] == 'c'
        ] * 2

        shuffle(shape_cards_b)
        shuffle(shape_cards_c)

        self.deck_b = shape_cards_b
        self.deck_c = shape_cards_c

        self.b_cards_pp = len(shape_cards_b) // nplayers
        self.c_cards_pp = len(shape_cards_c) // nplayers

    def deal_shape_cards(self):
        player_cards = self.deck_b[0 : self.b_cards_pp]
        player_cards += self.deck_c[0 : self.c_cards_pp]

        shuffle(player_cards)

        self.deck_c = self.deck_c[self.c_cards_pp :]
        self.deck_b = self.deck_b[self.b_cards_pp :]

        return player_cards


class MovCardDealer:
    def deal_movement_cards(player_id: str, ncards: int = 3):
        cards = list(movement_data.keys()) * 7
        shuffle(cards)

        for c in cc.currently_used_movements(db=next(get_db()), player_id=player_id):
            cards.remove(c)

        return cards[0:ncards]
