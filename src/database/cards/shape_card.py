from pydantic import BaseModel


class ShapeData(BaseModel):
    data: list[tuple[int, int]]


shape_data = {
    'c-0': ShapeData(data=[[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]]),
    'c-1': ShapeData(data=[[0, 1], [1, 1], [1, 0], [2, 0], [3, 0]]),
    'c-2': ShapeData(data=[[0, 0], [1, 0], [2, 0], [2, 1], [3, 1]]),
    'c-3': ShapeData(data=[[0, 1], [0, 2], [1, 0], [1, 1], [2, 0]]),
    'c-4': ShapeData(data=[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]),
    'c-5': ShapeData(data=[[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]]),
    'c-6': ShapeData(data=[[0, 1], [1, 1], [2, 1], [3, 0], [3, 1]]),
    'c-7': ShapeData(data=[[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]]),
    'c-8': ShapeData(data=[[0, 1], [1, 0], [1, 1], [2, 1], [2, 2]]),
    'c-9': ShapeData(data=[[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]]),
    'c-10': ShapeData(data=[[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]]),
    'c-11': ShapeData(data=[[0, 1], [0, 2], [1, 1], [2, 0], [2, 1]]),
    'c-12': ShapeData(data=[[0, 1], [1, 1], [2, 0], [2, 1], [3, 1]]),
    'c-13': ShapeData(data=[[0, 0], [1, 0], [2, 0], [2, 1], [3, 0]]),
    'c-14': ShapeData(data=[[0, 0], [1, 0], [1, 1], [2, 0], [2, 1]]),
    'c-15': ShapeData(data=[[0, 0], [0, 1], [1, 0], [2, 0], [2, 1]]),
    'c-16': ShapeData(data=[[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]]),
    'c-17': ShapeData(data=[[0, 1], [1, 0], [1, 1], [2, 0], [2, 1]]),
    'b-0': ShapeData(data=[[0, 0], [1, 0], [1, 1], [2, 1]]),
    'b-1': ShapeData(data=[[0, 0], [0, 1], [1, 0], [1, 1]]),
    'b-2': ShapeData(data=[[0, 1], [1, 0], [1, 1], [2, 0]]),
    'b-3': ShapeData(data=[[0, 0], [1, 0], [1, 1], [2, 0]]),
    'b-4': ShapeData(data=[[0, 1], [1, 1], [2, 0], [2, 1]]),
    'b-5': ShapeData(data=[[0, 0], [1, 0], [2, 0], [3, 0]]),
    'b-6': ShapeData(data=[[0, 0], [1, 0], [2, 0], [2, 1]]),
}
