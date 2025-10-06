# Руководство по написанию кастомных функций группировки в TanStack Table

## Обзор

TanStack Table позволяет создавать собственные функции агрегации для группировки данных. Функции агрегации используются для вычисления сводных значений по группам строк.

## Структура функции агрегации

Каждая функция агрегации имеет следующую сигнатуру:

```typescript
type AggregationFn<TData extends AnyData> = (
  columnId: string,
  leafRows: Row<TData>[],
  childRows: Row<TData>[]
) => any;
```

### Параметры:

- **`columnId`** - ID колонки, для которой выполняется агрегация
- **`leafRows`** - массив строк-листьев (конечные строки без подгрупп)
- **`childRows`** - массив дочерних строк (непосредственные дочерние строки)

## Примеры кастомных функций агрегации

### 1. Сумма значений

```typescript
sumAmount: (columnId, leafRows, _childRows) => {
  const values = leafRows.map((row) => {
    const value = row.getValue(columnId);
    return typeof value === "number" ? value : 0;
  });

  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum;
};
```

### 2. Среднее значение

```typescript
avgAmount: (columnId, leafRows, _childRows) => {
  const values = leafRows.map((row) => {
    const value = row.getValue(columnId);
    return typeof value === "number" ? value : 0;
  });

  const sum = values.reduce((acc, value) => acc + value, 0);
  const avg = values.length > 0 ? sum / values.length : 0;

  return Math.round(avg * 100) / 100; // Округляем до 2 знаков
};
```

### 3. Количество записей с условием

```typescript
countPurchases: (columnId, leafRows, _childRows) => {
  const count = leafRows.filter((row) => {
    const value = row.getValue(columnId);
    return typeof value === "number" && value > 0;
  }).length;

  return count;
};
```

### 4. Максимальное и минимальное значения

```typescript
maxAmount: (columnId, leafRows, _childRows) => {
  const values = leafRows.map((row) => {
    const value = row.getValue(columnId);
    return typeof value === "number" ? value : 0;
  });

  return values.length > 0 ? Math.max(...values) : 0;
};

minAmount: (columnId, leafRows, _childRows) => {
  const values = leafRows.map((row) => {
    const value = row.getValue(columnId);
    return typeof value === "number" ? value : 0;
  });

  return values.length > 0 ? Math.min(...values) : 0;
};
```

### 5. Сложная агрегация с использованием childRows

```typescript
customStats: (columnId, leafRows, childRows) => {
  const leafValues = leafRows.map((row) => {
    const value = row.getValue(columnId);
    return typeof value === "number" ? value : 0;
  });

  const childValues = childRows.map((row) => {
    const value = row.getValue(columnId);
    return typeof value === "number" ? value : 0;
  });

  const leafSum = leafValues.reduce((acc, value) => acc + value, 0);
  const childSum = childValues.reduce((acc, value) => acc + value, 0);
  const totalSum = leafSum + childSum;

  return totalSum;
};
```

## Настройка в таблице

### 1. Объявление типов

```typescript
declare module "@tanstack/react-table" {
  interface AggregationFns {
    sumAmount: AggregationFn<unknown>;
    avgAmount: AggregationFn<unknown>;
    countPurchases: AggregationFn<unknown>;
    maxAmount: AggregationFn<unknown>;
    minAmount: AggregationFn<unknown>;
    customStats: AggregationFn<unknown>;
  }
}
```

### 2. Конфигурация таблицы

```typescript
const table = useReactTable({
  data: items,
  columns,
  state: {
    grouping,
  },
  onGroupingChange: setGrouping,
  getGroupedRowModel: getGroupedRowModel(),
  aggregationFns: {
    sumAmount: (columnId, leafRows, _childRows) => {
      /* ... */
    },
    avgAmount: (columnId, leafRows, _childRows) => {
      /* ... */
    },
    // ... другие функции
  },
});
```

### 3. Использование в колонках

```typescript
{
  accessorKey: "amount",
  header: () => <span>Сумма</span>,
  aggregationFn: "sumAmount",
  aggregatedCell: ({ getValue }) => {
    const value = getValue() as number;
    return `Итого: ${value.toLocaleString("ru-RU")} ₽`;
  },
}
```

## Кастомный рендерер для агрегированных ячеек

Используйте `aggregatedCell` для кастомного отображения агрегированных значений:

```typescript
aggregatedCell: ({ getValue }) => {
  const value = getValue() as number;
  return `Итого: ${value.toLocaleString("ru-RU")} ₽`;
};
```

## Встроенные функции агрегации

TanStack Table предоставляет следующие встроенные функции:

- `sum` - сумма значений
- `min` - минимальное значение
- `max` - максимальное значение
- `extent` - диапазон (мин и макс)
- `mean` - среднее значение
- `median` - медиана
- `unique` - уникальные значения
- `uniqueCount` - количество уникальных значений
- `count` - количество строк

## Советы по написанию функций агрегации

1. **Всегда проверяйте типы данных** - используйте `typeof` для проверки типов
2. **Обрабатывайте пустые массивы** - проверяйте `values.length > 0`
3. **Используйте `leafRows` для точных вычислений** - они содержат конечные данные
4. **Используйте `childRows` для сложной логики** - когда нужно учитывать промежуточные результаты
5. **Добавляйте логирование** - для отладки и понимания работы функции
6. **Округляйте числа** - для лучшего отображения результатов

## Примеры использования

В текущем проекте реализованы следующие функции агрегации:

- **sumAmount** - суммирует все значения в группе
- **avgAmount** - вычисляет среднее значение
- **countPurchases** - считает количество покупок (не нулевых значений)
- **maxAmount** - находит максимальное значение
- **minAmount** - находит минимальное значение
- **customStats** - сложная агрегация с использованием childRows

Все функции настроены для работы с колонкой `amount` и отображают результаты в удобном формате с русской локализацией.
