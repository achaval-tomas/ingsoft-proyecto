from json import dumps, loads


def serialize(obj):
    return dumps(obj)


def deserialize(obj):
    return loads(obj)
