# ПАСПОРТ АРХИТЕКТУРЫ AURA

## Semantic Shell + Memgraph Tree

### Версия 1.0 — базовый норматив

---

# 1. НАЗНАЧЕНИЕ СИСТЕМЫ

AURA предназначена для управления программным проектом как семантическим деревом атомарных компонентов — Shell.

AURA не должна рассматривать проект исключительно как набор исходных файлов.

Единицей архитектуры является Shell — самостоятельный атомарный узел, содержащий:

* семантическое назначение;
* архитектурный контракт;
* зависимости;
* ограничения;
* исполняемую реализацию;
* правила валидации;
* метаданные;
* связь с другими Shell.

Проект в целом представляет собой граф взаимосвязанных Shell.

Файловая структура проекта является физическим представлением этого дерева.

Memgraph является семантическим представлением отношений между его узлами.

Таким образом:

```
Shell = атомарная единица проекта

Directory Tree = физическая организация Shell

Memgraph = граф отношений Shell

AURA = система управления, анализа, валидации и изменения этого графа
```

---

# 2. ОСНОВНОЙ ПРИНЦИП

Проект должен быть построен не вокруг файлов, а вокруг семантических узлов.

Файл является контейнером Shell.

Shell является архитектурной единицей.

Связь между Shell является частью архитектуры.

Изменение проекта должно происходить через изменение конкретных Shell, а не через произвольное редактирование множества файлов.

Основной цикл:

```
REQUIREMENT
    ↓
SEMANTIC TREE
    ↓
SHELL
    ↓
VALIDATION
    ↓
CODE
    ↓
BUILD
    ↓
TEST
    ↓
PROJECT
```

Обратный цикл при модернизации:

```
USER REQUEST
    ↓
AURA
    ↓
GRAPH QUERY
    ↓
AFFECTED SHELLS
    ↓
MODIFY / CREATE / DELETE SHELL
    ↓
VALIDATION
    ↓
BUILD
    ↓
TEST
    ↓
APPLY
```

---

# 3. ЧТО ТАКОЕ SHELL

Shell — это атомарный архитектурный контейнер.

Shell не должен быть просто файлом с кодом.

Минимальная модель Shell:

```
Identity
Semantic Contract
Dependencies
Rules
Implementation
Validation
Metadata
```

Концептуально:

```
┌───────────────────────────────┐
│ SHELL                         │
│                               │
│ Identity                      │
│ Semantic Contract             │
│ Dependencies                  │
│ Rules                         │
│ Implementation                │
│ Validation                    │
│ Metadata                      │
│                               │
└───────────────────────────────┘
```

Shell должен быть:

* атомарным;
* однозначным;
* идентифицируемым;
* версионируемым;
* валидируемым;
* связанным с другими Shell;
* заменяемым;
* удаляемым без разрушения всей системы при отсутствии зависимостей.

---

# 4. АТОМАРНОСТЬ SHELL

Shell должен описывать одну логически завершённую архитектурную единицу.

Правильно:

```
DamageSystem.shell

HealthComponent.shell

CriticalHitSystem.shell

WeaponTimer.shell
```

Неправильно:

```
EverythingCombat.shell
```

если внутри него находятся:

```
damage
armor
critical
healing
death
inventory
```

Атомарность необходима для того, чтобы AURA могла изменить один лист дерева, не переписывая соседние части системы.

---

# 5. SEMANTIC CONTRACT

Каждый Shell обязан иметь семантическое описание.

Минимально:

```
subject
action
object
```

Формат:

```
Subject → Action → Object
```

Например:

```
DamageSystem → APPLY → HealthComponent
```

или:

```
WeaponTimerSystem → UPDATE → WeaponTimerState
```

Семантический контракт описывает, зачем существует Shell.

Код описывает, как это реализуется.

Следовательно:

```
SEMANTICS ≠ CODE
```

но:

```
SHELL = SEMANTICS + CODE + CONTRACT
```

Семантика не должна восстанавливаться из кода постфактум как единственный источник истины.

---

# 6. IDENTITY SHELL

Каждый Shell обязан иметь стабильный идентификатор.

Например:

```
shell_id:
    combat.damage
```

или UUID с человекочитаемым slug.

Рекомендуемая модель:

```
id
name
namespace
version
status
```

Пример:

```
id: combat.damage
name: DamageSystem
namespace: combat
version: 1.0.0
status: ACTIVE
```

ID не должен зависеть от абсолютного пути файла.

Это позволяет перемещать Shell внутри проекта без разрушения его семантической идентичности.

---

# 7. ЖИЗНЕННЫЙ ЦИКЛ SHELL

Shell имеет жизненный цикл.

```
PROPOSED
    ↓
VALIDATING
    ↓
ACTIVE
    ↓
DEPRECATED
    ↓
REMOVED
```

Допустимо также:

```
ACTIVE
   ↓
REPLACED
   ↓
REMOVED
```

Удаление Shell разрешается только после проверки зависимостей.

Если:

```
A → DEPENDS_ON → B
```

то удаление B должно вызвать проверку всех зависимых узлов.

---

# 8. СТРУКТУРА SHELL

Физический формат будет уточнён после анализа остальных промптов AURA.

Однако нормативно Shell должен содержать следующие логические секции:

```
IDENTITY

SEMANTICS

CONTRACT

DEPENDENCIES

INPUTS

OUTPUTS

RULES

IMPLEMENTATION

VALIDATION

METADATA
```

Порядок физического хранения может быть изменён.

Логический состав — нет, если иное не будет установлено архитектурой AURA.

---

# 9. IMPLEMENTATION

Implementation содержит исполняемый код Shell.

Для luaScript:

```
IMPLEMENTATION
    language = "luaScript"
    code = ...
```

Код Shell не должен существовать отдельно от его семантического контракта, если он представляет атомарную архитектурную единицу.

Это предотвращает ситуацию:

```
semantic node существует
```

но:

```
implementation потеряна
```

или:

```
implementation существует
```

но:

```
AURA не знает, что она означает.
```

---

# 10. VALIDATION

Каждый Shell должен иметь проверяемые условия корректности.

Validation должна проверять как минимум:

```
syntax
semantic contract
dependencies
implementation
graph consistency
```

Для luaScript дополнительно:

```
lexer
parser
validator
codegen
tests
```

Shell считается пригодным для внедрения только после успешной валидации.

---

# 11. ДЕРЕВО ПРОЕКТА

Физически проект может выглядеть следующим образом:

```
project/
│
├── .aura/
│   ├── config
│   ├── graph
│   ├── indexes
│   └── schemas
│
├── shells/
│   ├── combat/
│   │   ├── damage.shell
│   │   ├── critical.shell
│   │   └── armor.shell
│   │
│   ├── movement/
│   │   └── movement.shell
│   │
│   └── weapons/
│       └── weapon_timer.shell
│
└── generated/
```

Главный принцип:

```
shells/ = source of truth

generated/ = производный результат

graph = индекс семантических отношений
```

---

# 12. MEMGRAPH

Memgraph используется не как обычное хранилище исходного кода.

Memgraph хранит семантическую модель проекта.

Он должен отвечать на вопросы:

```
Что существует?

Где находится?

От чего зависит?

Что использует данный Shell?

Что изменится при удалении Shell?

Какие Shell реализуют определённую механику?

Какие Shell относятся к конкретной системе?

Какие компоненты затрагивает конкретное правило?

Какие узлы нужно перевалидировать после изменения?
```

---

# 13. NODE MODEL

Минимальная вершина графа:

```
(:Shell)
```

Пример:

```
(:Shell {
    id: "combat.damage",
    name: "DamageSystem",
    version: "1.0.0",
    status: "ACTIVE",
    path: "shells/combat/damage.shell"
})
```

Дополнительные типы узлов могут появиться позже:

```
Shell
Component
System
Rule
Entity
Feature
Test
Asset
```

Но Shell должен оставаться центральной единицей.

---

# 14. RELATIONSHIP MODEL

Основные связи:

```
DEPENDS_ON
REQUIRES
PROVIDES
MODIFIES
READS
WRITES
IMPLEMENTS
TESTED_BY
CONTAINS
EXTENDS
REPLACES
```

Пример:

```
DamageSystem
    ├── REQUIRES → HealthComponent
    ├── READS → AttackComponent
    ├── MODIFIES → HealthComponent
    └── TESTED_BY → DamageSystemTest
```

---

# 15. ГРАФ НЕ ЯВЛЯЕТСЯ ВТОРЫМ SOURCE OF TRUTH

Критическое правило.

Исходным источником истины являются Shell.

Memgraph является индексом и семантическим графом.

То есть:

```
Shell
   ↓
Indexer
   ↓
Memgraph
```

а не:

```
Memgraph
   ↓
Shell
```

Это защищает проект от ситуации, когда база данных и файлы расходятся.

При необходимости граф может быть полностью пересобран из Shell.

---

# 16. СИНХРОНИЗАЦИЯ

AURA должна уметь выполнять:

```
scan project
    ↓
discover shells
    ↓
parse metadata
    ↓
validate identity
    ↓
rebuild/update graph
    ↓
validate relationships
```

Таким образом Memgraph можно восстановить из файлов.

Это принципиально важно.

Если Memgraph будет потерян, проект не должен потерять архитектуру.

Можно восстановить:

```
filesystem
    ↓
AURA INDEXER
    ↓
MEMGRAPH
```

---

# 17. ЗАПРОС К ПРОЕКТУ

AI не должен читать весь проект для каждого изменения.

Сначала AI обращается к AURA.

AURA выполняет запрос к графу.

Например:

```
"Какие Shell связаны с WeaponTimerSystem?"
```

AURA получает:

```
WeaponTimerSystem
WeaponComponent
TimerComponent
UpdateTimerSystem
CleanerSystem
WeaponTimerTest
```

AI получает компактное состояние нужного участка дерева.

---

# 18. ЛОКАЛЬНОЕ ИЗМЕНЕНИЕ

Пользователь сообщает:

```
"Добавить автоматический сброс таймера оружия."
```

AURA не должна сразу изменять код.

Сначала:

```
requirement
    ↓
semantic search
    ↓
graph query
    ↓
affected shells
    ↓
dependency analysis
```

Например:

```
WeaponTimerSystem
WeaponTimerComponent
WeaponTimerTest
```

После этого AI предлагает изменение только этих Shell.

---

# 19. PATCH MODEL

Изменение проекта должно представляться как операция над листьями.

Например:

```
CREATE SHELL
UPDATE SHELL
DELETE SHELL
REPLACE SHELL
ADD RELATION
REMOVE RELATION
```

Пример:

```
UPDATE SHELL
    id = weapon.timer

ADD SHELL
    id = weapon.timer.reset

ADD RELATION
    weapon.timer.reset
    DEPENDS_ON
    weapon.timer
```

AURA затем валидирует изменение.

---

# 20. ЗАПРЕТ НА НЕКОНТРОЛИРУЕМУЮ ПРАВКУ

AI не должен произвольно менять:

```
весь проект
```

или:

```
произвольные исходные файлы.
```

AI должен работать через архитектурный интерфейс AURA.

Правильная цепочка:

```
AI
  ↓
AURA QUERY
  ↓
GRAPH
  ↓
SHELL SET
  ↓
PROPOSED PATCH
  ↓
VALIDATOR
  ↓
APPLY
  ↓
REINDEX
```

---

# 21. ДЕТЕРМИНИРОВАННОЕ ВНЕДРЕНИЕ

AI может быть вероятностным.

AURA должна быть детерминированной.

То есть:

```
AI proposes

AURA validates

AURA decides whether patch is structurally valid

compiler produces deterministic output
```

Один и тот же набор Shell и одна и та же версия компилятора должны давать одинаковый результат.

---

# 22. ВАЛИДАЦИЯ ГРАФА

После изменения Shell AURA должна определить затронутую область.

Например:

```
UPDATE HealthComponent
```

может затронуть:

```
DamageSystem
HealingSystem
DeathSystem
ShieldSystem
HealthBarSystem
```

AURA должна найти эти зависимости через граф.

Именно здесь Memgraph приносит реальную пользу.

Без графа пришлось бы каждый раз анализировать весь проект.

---

# 23. УДАЛЕНИЕ ЛИСТА

Удаление Shell:

```
DELETE shell X
```

не должно автоматически означать:

```
rm file
```

Сначала:

```
find dependents
    ↓
validate dependencies
    ↓
determine affected shells
    ↓
reject OR cascade update
    ↓
delete shell
    ↓
update graph
    ↓
validate project
```

Удаление неактуального листа является нормальной операцией жизненного цикла проекта.

---

# 24. ОБНОВЛЕНИЕ ИГРЫ

Это одна из главных целей архитектуры.

Старая модель:

```
изменить систему
    ↓
найти десятки файлов
    ↓
изменить код
    ↓
исправлять побочные эффекты
```

Модель AURA:

```
новое требование
    ↓
найти семантический участок дерева
    ↓
определить affected shells
    ↓
добавить/изменить/удалить листья
    ↓
graph validation
    ↓
code validation
    ↓
tests
    ↓
build
```

Следовательно, обновление игры становится операцией над семантическим графом.

---

# 25. ПРАВИЛО "НЕ ТРОГАТЬ ЛИСТЬЯ РУКАМИ"

Рабочий режим проекта:

```
Human
    ↓
Requirement

AI
    ↓
Proposal

AURA
    ↓
Validation

AURA
    ↓
Apply

Compiler
    ↓
Build
```

Человек и AI не должны произвольно редактировать конечный код в обход архитектурного механизма.

Это обеспечивает воспроизводимость.

---

# 26. РОЛЬ AURA

AURA является оркестратором.

Она должна отвечать за:

```
discovery
indexing
graph synchronization
semantic queries
dependency resolution
shell validation
patch planning
patch application
compilation
testing
project state
```

AURA не должна сама становиться бизнес-логикой игры.

Она управляет структурой проекта.

---

# 27. РОЛЬ MEMGRAPH

Memgraph отвечает прежде всего за:

```
relationships
dependency traversal
semantic queries
graph analysis
impact analysis
```

Memgraph не должен становиться:

```
единственным хранилищем исходников
```

и не должен содержать:

```
единственную копию кода Shell.
```

---

# 28. КЛЮЧЕВАЯ АРХИТЕКТУРНАЯ ФОРМУЛА

Основная формула AURA:

```
PROJECT
  =
SHELLS
  +
SEMANTIC RELATIONSHIPS
```

При этом:

```
SHELL
  =
SEMANTICS
  +
CONTRACT
  +
IMPLEMENTATION
  +
VALIDATION
  +
METADATA
```

А:

```
PROJECT GRAPH
  =
SHELL NODES
  +
RELATION EDGES
```

---

# 29. ПРИНЦИП ИЗМЕНЯЕМОСТИ

Проект не должен восприниматься как монолит.

Он должен восприниматься как конгломерат актуальных листьев.

Например:

```
v1

Combat
  ├── Damage
  ├── Armor
  └── Critical
```

После обновления:

```
v2

Combat
  ├── Damage
  ├── Armor
  ├── Critical
  └── Resistance
```

При удалении старой механики:

```
v3

Combat
  ├── Damage
  ├── Resistance
  └── Critical
```

Лист может быть:

```
created
replaced
deprecated
removed
```

без необходимости переписывать всю архитектуру.

---

# 30. ГЛАВНЫЙ ИНВАРИАНТ

AURA должна всегда иметь возможность ответить на четыре вопроса:

```
1. Что это?

2. Зачем это существует?

3. С чем это связано?

4. Как это реализовано?
```

Если AURA не может ответить хотя бы на один из них, Shell считается неполным.

---

# 31. ИТОГОВАЯ МОДЕЛЬ

Конечная архитектура должна выглядеть так:

```
                   AURA
                     │
      ┌──────────────┼──────────────┐
      │              │              │
   QUERY          VALIDATOR       BUILDER
      │              │              │
      └───────┬──────┴──────┬───────┘
              │             │
          MEMGRAPH       SHELLS
              │             │
      semantic graph    source of truth
              │             │
              └──────┬──────┘
                     │
                luaScript 2.0
                     │
                  OUTPUT
```

При этом каждый лист:

```
                SHELL
                  │
      ┌───────────┼───────────┐
      │           │           │
   SEMANTICS    RULES       CODE
      │           │           │
      └───────────┼───────────┘
                  │
             VALIDATION
                  │
                ACTIVE
```

Именно такая архитектура позволяет AURA не просто "генерировать код", а **понимать структуру проекта, находить затронутые семантические листья, изменять только необходимые части и детерминированно внедрять результат после валидации**.

---

# 32. СТАТУС ПАСПОРТА

Этот документ является базовым архитектурным контрактом.

Он НЕ фиксирует окончательно:

* конкретный синтаксис `.shell`;
* точную схему Memgraph;
* API AURA;
* формат Cypher-запросов;
* формат patch;
* структуру `.aura`;
* правила конкретного luaScript;
* правила конкретных игровых систем.

Эти части должны быть уточнены после анализа остальных промптов AURA Architect / Executor.

До завершения анализа новых материалов данные решения считаются предварительными.
