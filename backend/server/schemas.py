#This file (schemas.py) is dedicated space to store and provide data
#validation for the api

from pydantic import BaseModel

#
class Frame(BaseModel):
    image: str