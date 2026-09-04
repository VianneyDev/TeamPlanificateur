# @vianneytraina/ui

Accessible React components and design tokens extracted from TeamPlanificateur.

```sh
npm i @vianneytraina/ui
```

`react` and `react-dom` are peer dependencies (`>=18`).

Import the stylesheet once in the Astro layout, not per island:

```js
import "@vianneytraina/ui/styles.css";
```

Then import components by name:

```jsx
import { Button } from "@vianneytraina/ui";

<Button intent="neutral" emphasis="filled">Enregistrer</Button>
```

## Migrating Button off `variant`

`Button` used to mix meaning and look in a single `variant` prop (`default`, `ghost`, `outline`, `danger`). From 2.0.0, use `intent` (what the action means) and `emphasis` (how strongly it is drawn). `variant` was removed.

| `variant` (v1) | `intent` | `emphasis` |
| --- | --- | --- |
| `default` | `neutral` | `filled` |
| `ghost` | `neutral` | `ghost` |
| `outline` | `neutral` | `outline` |
| `danger` | `danger` | `filled` |

```jsx
// Before
<Button variant="outline">Annuler</Button>
<Button variant="danger">Supprimer</Button>

// After
<Button intent="neutral" emphasis="outline">Annuler</Button>
<Button intent="danger" emphasis="filled">Supprimer</Button>
```
