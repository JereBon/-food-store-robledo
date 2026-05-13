from app.modules.ingredientes.model import Ingrediente
from app.modules.ingredientes.repository import IngredienteRepository
from app.modules.ingredientes.schemas import IngredienteCreate, IngredienteUpdate


class IngredienteService:
    def __init__(self, repository: IngredienteRepository):
        self.repository = repository

    def create(self, data: IngredienteCreate) -> Ingrediente:
        existing = self.repository.get_by_nombre(data.nombre)
        if existing:
            raise ValueError(f"Ingredient '{data.nombre}' already exists")
        ingredient = Ingrediente(
            nombre=data.nombre,
            es_alergeno=data.es_alergeno,
        )
        return self.repository.create(ingredient)

    def update(self, ingredient: Ingrediente, data: IngredienteUpdate) -> Ingrediente:
        if data.nombre is not None and data.nombre != ingredient.nombre:
            existing = self.repository.get_by_nombre(data.nombre)
            if existing:
                raise ValueError(f"Ingredient '{data.nombre}' already exists")
        update_data = data.model_dump(exclude_none=True)
        return self.repository.update(ingredient, update_data)
