from abc import ABC, abstractmethod
from typing import List, Dict, Any
import threading
from dataclasses import dataclass

# Singleton Pattern
class Singleton:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
            return cls._instance

# Factory Pattern
class Factory:
    def create_product(self, product_type: str) -> 'Product':
        if product_type == "A":
            return ProductA()
        elif product_type == "B":
            return ProductB()
        raise ValueError(f"Unknown product type: {product_type}")

class Product(ABC):
    @abstractmethod
    def operation(self) -> str:
        pass

class ProductA(Product):
    def operation(self) -> str:
        return "Product A"

class ProductB(Product):
    def operation(self) -> str:
        return "Product B"

# Observer Pattern
class Subject:
    def __init__(self):
        self._observers: List['Observer'] = []
        self._state = None

    def attach(self, observer: 'Observer') -> None:
        self._observers.append(observer)

    def detach(self, observer: 'Observer') -> None:
        self._observers.remove(observer)

    def notify(self) -> None:
        for observer in self._observers:
            observer.update(self._state)

    @property
    def state(self):
        return self._state

    @state.setter
    def state(self, value):
        self._state = value
        self.notify()

class Observer(ABC):
    @abstractmethod
    def update(self, state: Any) -> None:
        pass

class ConcreteObserver(Observer):
    def update(self, state: Any) -> None:
        print(f"Observer state updated: {state}")

# Strategy Pattern
class Strategy(ABC):
    @abstractmethod
    def execute(self, data: Any) -> Any:
        pass

class ConcreteStrategyA(Strategy):
    def execute(self, data: Any) -> Any:
        return f"Strategy A processing: {data}"

class ConcreteStrategyB(Strategy):
    def execute(self, data: Any) -> Any:
        return f"Strategy B processing: {data}"

class Context:
    def __init__(self, strategy: Strategy):
        self._strategy = strategy

    def set_strategy(self, strategy: Strategy):
        self._strategy = strategy

    def execute_strategy(self, data: Any) -> Any:
        return self._strategy.execute(data)

# Decorator Pattern
@dataclass
class Component(ABC):
    @abstractmethod
    def operation(self) -> str:
        pass

class ConcreteComponent(Component):
    def operation(self) -> str:
        return "ConcreteComponent"

class Decorator(Component):
    def __init__(self, component: Component):
        self._component = component

    def operation(self) -> str:
        return self._component.operation()

class ConcreteDecoratorA(Decorator):
    def operation(self) -> str:
        return f"ConcreteDecoratorA({super().operation()})"

class ConcreteDecoratorB(Decorator):
    def operation(self) -> str:
        return f"ConcreteDecoratorB({super().operation()})"
